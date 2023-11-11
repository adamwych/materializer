import { GLTF } from "@gltf-transform/core";
import * as glMatrix from "gl-matrix";
import fragGlsl from "../../../resources/glsl/env-preview.frag.glsl?raw";
import vertGlsl from "../../../resources/glsl/env-preview.vert.glsl?raw";
import planeGltf from "../../../resources/models/plane.gltf?raw";
import { toRadians } from "../../utils/math";
import { MaterialSnapshot } from "../types";
import WebGLEnvironmentalPreviewModel from "./env-preview-model";
import WebGLNodeRenderer from "./node-renderer";

export default class WebGLEnvironmentalPreviewRenderer {
    private readonly envCanvasContext: OffscreenCanvasRenderingContext2D;
    private fbo?: WebGLFramebuffer;
    private shaderProgram?: WebGLProgram;
    private transformMatrixUniformLoc?: WebGLUniformLocation;
    private pixelsData: Uint8Array;
    private model?: WebGLEnvironmentalPreviewModel;

    private cameraMatrix = glMatrix.mat4.create();
    private cameraZoom = 3;
    private cameraRotationX = toRadians(225);
    private cameraRotationY = toRadians(-135);

    constructor(
        private readonly envCanvas: OffscreenCanvas,
        private readonly gl: WebGL2RenderingContext,
        private readonly nodeRenderer: WebGLNodeRenderer,
    ) {
        this.pixelsData = new Uint8Array(this.envCanvas.width * this.envCanvas.height * 4);
        this.envCanvasContext = envCanvas.getContext("2d")!;

        this.initializeFramebuffer();
        this.initializeShaderProgram();
        this.loadModel(JSON.parse(planeGltf));
        this.updateCameraMatrix();
    }

    private initializeFramebuffer() {
        const gl = this.gl;

        this.fbo = gl.createFramebuffer()!;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);

        const colorTexture = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, colorTexture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGB,
            this.envCanvas.width,
            this.envCanvas.height,
            0,
            gl.RGB,
            gl.UNSIGNED_BYTE,
            null,
        );

        gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, null);

        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            colorTexture,
            0,
        );

        const depthTexture = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, depthTexture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.DEPTH_COMPONENT32F,
            this.envCanvas.width,
            this.envCanvas.height,
            0,
            gl.DEPTH_COMPONENT,
            gl.FLOAT,
            null,
        );

        gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, null);

        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.DEPTH_ATTACHMENT,
            gl.TEXTURE_2D,
            depthTexture,
            0,
        );
    }

    private initializeShaderProgram() {
        const vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER)!;
        this.gl.shaderSource(vertexShader, vertGlsl);
        this.gl.compileShader(vertexShader);

        const fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER)!;
        this.gl.shaderSource(fragmentShader, fragGlsl);
        this.gl.compileShader(fragmentShader);

        this.shaderProgram = this.gl.createProgram()!;
        this.gl.attachShader(this.shaderProgram, vertexShader);
        this.gl.attachShader(this.shaderProgram, fragmentShader);
        this.gl.linkProgram(this.shaderProgram);
        this.gl.deleteShader(vertexShader);
        this.gl.deleteShader(fragmentShader);

        this.transformMatrixUniformLoc = this.gl.getUniformLocation(
            this.shaderProgram,
            "uTransformMatrix",
        )!;
    }

    public render(material: MaterialSnapshot) {
        if (!this.model) {
            return;
        }

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo!);

        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.viewport(0, 0, this.envCanvas.width, this.envCanvas.height);
        this.gl.clearColor(0.1, 0.1, 0.1, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.useProgram(this.shaderProgram!);
        this.gl.bindVertexArray(this.model.getVertexArrayObject());

        const outputNodes = Array.from(material.nodes.values()).filter(
            ({ node }) => node.path === "materializer/output",
        );
        if (outputNodes.length > 0) {
            outputNodes.forEach((outputNode) => {
                this.gl.activeTexture(this.gl.TEXTURE0);
                this.gl.bindTexture(
                    this.gl.TEXTURE_2D,
                    this.nodeRenderer.getNodeOutputTexture(outputNode.node.id)!,
                );
            });
        } else {
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        }

        this.gl.uniformMatrix4fv(this.transformMatrixUniformLoc!, false, this.cameraMatrix);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.model.getIndexBuffer());
        this.gl.drawElements(
            this.gl.TRIANGLES,
            this.model.getNumberOfVertices(),
            this.gl.UNSIGNED_SHORT,
            0,
        );
        this.gl.disable(this.gl.DEPTH_TEST);

        // Read pixels from the color attachment and draw them onto the final canvas.
        this.gl.readBuffer(this.gl.COLOR_ATTACHMENT0);
        this.gl.readPixels(
            0,
            0,
            this.envCanvas.width,
            this.envCanvas.height,
            this.gl.RGBA,
            this.gl.UNSIGNED_BYTE,
            this.pixelsData,
        );

        this.envCanvasContext.putImageData(
            new ImageData(
                new Uint8ClampedArray(this.pixelsData),
                this.envCanvas.width,
                this.envCanvas.height,
            ),
            0,
            0,
        );

        // Restore default state.
        this.gl.bindVertexArray(null);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }

    public setCameraTransform(rotationX: number, rotationY: number, zoom: number) {
        this.cameraRotationX = rotationX;
        this.cameraRotationY = rotationY;
        this.cameraZoom = zoom;
        this.updateCameraMatrix();
    }

    public updateCameraMatrix() {
        const projection = glMatrix.mat4.perspective(
            glMatrix.mat4.create(),
            toRadians(40),
            this.envCanvas.width / this.envCanvas.height,
            0.01,
            1000,
        );

        const view = glMatrix.mat4.lookAt(
            glMatrix.mat4.create(),
            glMatrix.vec3.fromValues(
                this.cameraZoom * Math.sin(-this.cameraRotationX) * Math.sin(this.cameraRotationY),
                this.cameraZoom * Math.cos(this.cameraRotationY),
                this.cameraZoom * Math.cos(-this.cameraRotationX) * Math.sin(this.cameraRotationY),
            ),
            glMatrix.vec3.fromValues(0, 0, 0),
            glMatrix.vec3.fromValues(0, 1, 0),
        );

        glMatrix.mat4.mul(this.cameraMatrix, projection, view);
    }

    public async loadModel(gltf: GLTF.IGLTF) {
        this.model?.cleanUp();
        this.model = await WebGLEnvironmentalPreviewModel.fromGltf(this.gl, gltf);
    }
}

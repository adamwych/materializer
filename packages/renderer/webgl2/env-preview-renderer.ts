import * as glMatrix from "gl-matrix";
import { toRadians } from "../../utils/math";
import { XZ_QUAD_VERTICES } from "../quads";
import WebGLNodeRenderer from "./node-renderer";
import { MaterialSnapshot } from "../types";

const VERTEX_SHADER_CODE = `
#version 300 es
precision highp float;

in vec3 aPosition;
in vec2 aTexCoords;

uniform mat4 uTransformMatrix;
out vec2 vTexCoords;

void main(void) {
    vTexCoords = aTexCoords;
    gl_Position = uTransformMatrix * vec4(aPosition, 1);
}`;

const FRAGMENT_SHADER_CODE = `
#version 300 es
precision highp float;

in vec2 vTexCoords;

uniform sampler2D uAlbedoTexture;

out vec4 outColor;

void main(void) {
    outColor = texture(uAlbedoTexture, vTexCoords);
}`;

export default class WebGLEnvironmentalPreviewRenderer {
    private readonly envCanvasContext: OffscreenCanvasRenderingContext2D;
    private fbo?: WebGLFramebuffer;
    private shaderProgram?: WebGLProgram;
    private vao?: WebGLVertexArrayObject;
    private vbo?: WebGLBuffer;
    private transformMatrixUniformLoc?: WebGLUniformLocation;
    private pixelsData: Uint8Array;

    private cameraMatrix = glMatrix.mat4.create();
    private cameraZoom = 4;
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
        this.initializeQuad();
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
            new Uint8Array(this.envCanvas.width * this.envCanvas.height * 3),
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
    }

    private initializeShaderProgram() {
        const vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER)!;
        this.gl.shaderSource(vertexShader, VERTEX_SHADER_CODE.trim());
        this.gl.compileShader(vertexShader);

        const fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER)!;
        this.gl.shaderSource(fragmentShader, FRAGMENT_SHADER_CODE.trim());
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

        this.transformMatrixUniformLoc = this.gl.getUniformLocation(
            this.shaderProgram,
            "uTransformMatrix",
        )!;
    }

    private initializeQuad() {
        const buffer = new ArrayBuffer(20 * XZ_QUAD_VERTICES.length);
        const dv = new DataView(buffer);
        for (let i = 0; i < XZ_QUAD_VERTICES.length; i++) {
            const v = XZ_QUAD_VERTICES[i];
            dv.setFloat32(20 * i, v[0][0], true);
            dv.setFloat32(20 * i + 4, v[0][1], true);
            dv.setFloat32(20 * i + 8, v[0][2], true);
            dv.setFloat32(20 * i + 12, v[1][0], true);
            dv.setFloat32(20 * i + 16, v[1][1], true);
        }

        this.vao = this.gl.createVertexArray()!;
        this.gl.bindVertexArray(this.vao);

        this.vbo = this.gl.createBuffer()!;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, buffer, this.gl.STATIC_DRAW);

        this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 20, 0);
        this.gl.enableVertexAttribArray(0);

        this.gl.vertexAttribPointer(1, 2, this.gl.FLOAT, false, 20, 3 * 4);
        this.gl.enableVertexAttribArray(1);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }

    public render(material: MaterialSnapshot) {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo!);

        this.gl.viewport(0, 0, this.envCanvas.width, this.envCanvas.height);
        this.gl.clearColor(0.1, 0.1, 0.1, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.useProgram(this.shaderProgram!);
        this.gl.bindVertexArray(this.vao!);

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
        this.gl.drawArrays(this.gl.TRIANGLES, 0, XZ_QUAD_VERTICES.length);

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
}

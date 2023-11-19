import * as glMatrix from "gl-matrix";
import fragGlsl from "../../../resources/glsl/editor-ui.fs?raw";
import vertGlsl from "../../../resources/glsl/editor-ui.vs?raw";
import { XY_QUAD_VERTICES } from "../quads";
import { MaterialNodeSnapshot, MaterialSnapshot } from "../types";
import WebGLNodeRenderer from "./node-renderer";

export default class WebGLEditorUIRenderer {
    private shaderProgram?: WebGLProgram;
    private vao?: WebGLVertexArrayObject;
    private vbo?: WebGLBuffer;
    private transformMatrixUniformLoc?: WebGLUniformLocation;
    private nodeTransformMatrixCache = new Map<number, glMatrix.mat4>();

    private cameraMatrix = glMatrix.mat4.create();
    private cameraOffsetX = 0;
    private cameraOffsetY = 0;
    private cameraScale = 1;

    constructor(
        private readonly canvas: OffscreenCanvas,
        private readonly gl: WebGL2RenderingContext,
        private readonly nodeRenderer: WebGLNodeRenderer,
    ) {
        this.initializeShaderProgram();
        this.initializeQuad();
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

    private initializeQuad() {
        const buffer = new ArrayBuffer(20 * XY_QUAD_VERTICES.length);
        const dv = new DataView(buffer);
        for (let i = 0; i < XY_QUAD_VERTICES.length; i++) {
            const v = XY_QUAD_VERTICES[i];
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
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.useProgram(this.shaderProgram!);
        this.gl.bindVertexArray(this.vao!);

        const temporaryMatrix = glMatrix.mat4.create();
        for (const snapshot of material.nodes.values()) {
            const transformMatrix = this.getNodeTransformMatrix(snapshot);
            glMatrix.mat4.mul(temporaryMatrix, this.cameraMatrix, transformMatrix);

            const texture = this.nodeRenderer.getNodeOutputTexture(snapshot.node.id);
            if (texture) {
                this.gl.activeTexture(this.gl.TEXTURE0);
                this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
            } else {
                this.gl.activeTexture(this.gl.TEXTURE0);
                this.gl.bindTexture(this.gl.TEXTURE_2D, null);
            }

            this.gl.uniformMatrix4fv(this.transformMatrixUniformLoc!, false, temporaryMatrix);
            this.gl.drawArrays(this.gl.TRIANGLES, 0, XY_QUAD_VERTICES.length);
        }

        this.gl.bindVertexArray(null);
    }

    private getNodeTransformMatrix(snapshot: MaterialNodeSnapshot) {
        const cachedMatrix = this.nodeTransformMatrixCache.get(snapshot.node.id);
        if (cachedMatrix) {
            return cachedMatrix;
        }

        const nodeSize = 128;
        const matrix = glMatrix.mat4.fromRotationTranslationScale(
            glMatrix.mat4.create(),
            glMatrix.quat.create(),
            [snapshot.node.x + nodeSize / 2, snapshot.node.y + nodeSize / 2, 0],
            [nodeSize / 2, nodeSize / 2, 1],
        );
        this.nodeTransformMatrixCache.set(snapshot.node.id, matrix);
        return matrix;
    }

    public clearNodeTransformCache(nodeId: number) {
        this.nodeTransformMatrixCache.delete(nodeId);
    }

    public updateCamera(offsetX: number, offsetY: number, scale: number) {
        this.cameraOffsetX = offsetX;
        this.cameraOffsetY = offsetY;
        this.cameraScale = scale;
        this.updateCameraMatrix();
    }

    public updateCameraMatrix() {
        glMatrix.mat4.mul(
            this.cameraMatrix,
            glMatrix.mat4.ortho(
                glMatrix.mat4.create(),
                0,
                this.canvas.width,
                this.canvas.height,
                0,
                0,
                1,
            ),
            glMatrix.mat4.fromRotationTranslationScaleOrigin(
                glMatrix.mat4.create(),
                glMatrix.quat.create(),
                [this.cameraOffsetX, this.cameraOffsetY, 0],
                [this.cameraScale, this.cameraScale, 1],
                [0, 0, 0],
            ),
        );
    }
}

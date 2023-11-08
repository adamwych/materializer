import * as glMatrix from "gl-matrix";
import { XY_QUAD_VERTICES } from "../quads";
import WebGLNodeRenderer from "./node-renderer";
import { easingSmoothstep } from "culori";
import { clamp } from "../../utils/math";
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

uniform float uAlpha;
uniform sampler2D uNodeTexture;

out vec4 outColor;

void main(void) {
    outColor = texture(uNodeTexture, vTexCoords);
    outColor.a = uAlpha;
}`;

export default class WebGLNodeThumbnailsRenderer {
    private shaderProgram?: WebGLProgram;
    private vao?: WebGLVertexArrayObject;
    private vbo?: WebGLBuffer;
    private transformMatrixUniformLoc?: WebGLUniformLocation;
    private enterAnimationTimers = new Map<number, number>();

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

        const nodeSize = 128;

        for (const snapshot of material.nodes.values()) {
            let animationTimer = clamp(this.enterAnimationTimers.get(snapshot.node.id) ?? 0, 0, 1);
            if (animationTimer < 1) {
                animationTimer += 0.05;
                requestAnimationFrame(() => {
                    this.render(material);
                });
            }
            this.enterAnimationTimers.set(snapshot.node.id, animationTimer);
            const scaleMultiplier = 0.95 + (1 - 0.95) * easingSmoothstep(animationTimer);

            const transformMatrix = glMatrix.mat4.mul(
                glMatrix.mat4.create(),
                this.cameraMatrix,
                glMatrix.mat4.fromRotationTranslationScale(
                    glMatrix.mat4.create(),
                    glMatrix.quat.create(),
                    [snapshot.node.x + nodeSize / 2, snapshot.node.y + nodeSize / 2, 0],
                    [(nodeSize / 2) * scaleMultiplier, (nodeSize / 2) * scaleMultiplier, 1],
                ),
            );

            const texture = this.nodeRenderer.getNodeOutputTexture(snapshot.node.id);
            if (texture) {
                this.gl.activeTexture(this.gl.TEXTURE0);
                this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
            } else {
                this.gl.activeTexture(this.gl.TEXTURE0);
                this.gl.bindTexture(this.gl.TEXTURE_2D, null);
            }

            this.gl.uniform1f(
                this.gl.getUniformLocation(this.shaderProgram!, "uAlpha"),
                animationTimer,
            );
            this.gl.uniformMatrix4fv(this.transformMatrixUniformLoc!, false, transformMatrix);
            this.gl.drawArrays(this.gl.TRIANGLES, 0, XY_QUAD_VERTICES.length);
        }

        this.gl.bindVertexArray(null);
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

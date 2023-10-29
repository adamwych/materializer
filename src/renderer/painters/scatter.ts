import { DeepReadonly } from "ts-essentials";
import { MaterialNode, MaterialNodePainterInfo } from "../../types/material";
import MaterialNodePainter from "./painter";
import MaterialNodeShaderProgram from "../program";
import glslCode from "../../../glsl/scatter.glsl?raw";
import * as glMatrix from "gl-matrix";
import seedrandom from "seedrandom";
import BlendMode from "../../types/blend-mode";

const QUAD_VERTICES = [
    [
        [-1, -1, 0],
        [0, 0],
    ],
    [
        [1, -1, 0],
        [1, 0],
    ],
    [
        [-1, 1, 0],
        [0, 1],
    ],

    [
        [1, -1, 0],
        [1, 0],
    ],
    [
        [-1, 1, 0],
        [0, 1],
    ],

    [
        [1, 1, 0],
        [1, 1],
    ],
];

export default class ScatterMaterialNodePainter implements MaterialNodePainter {
    private readonly shaderProgram: MaterialNodeShaderProgram;
    private readonly matrixBuffer: WebGLBuffer;
    private readonly vao: WebGLVertexArrayObject;
    private readonly vbo: WebGLBuffer;

    constructor(gl: WebGL2RenderingContext, info: MaterialNodePainterInfo) {
        if (info.type !== "scatter") {
            throw new Error("ScatterMaterialNodePainter can only be used for scatter nodes.");
        }

        this.shaderProgram = new MaterialNodeShaderProgram(
            gl,
            `
        #version 300 es
        precision highp float;

        in vec3 a_position;
        in vec2 a_texCoord;
        in mat4 i_transformMatrix;
        
        out vec2 v_texCoord;
        
        void main(void) {
            gl_Position = i_transformMatrix * vec4(a_position, 1);
            v_texCoord = a_texCoord;
        }
        `.trim(),
            glslCode,
        );

        const buffer = new ArrayBuffer(20 * QUAD_VERTICES.length);
        const dv = new DataView(buffer);
        for (let i = 0; i < QUAD_VERTICES.length; i++) {
            const v = QUAD_VERTICES[i];
            dv.setFloat32(20 * i, v[0][0], true);
            dv.setFloat32(20 * i + 4, v[0][1], true);
            dv.setFloat32(20 * i + 8, v[0][2], true);
            dv.setFloat32(20 * i + 12, v[1][0], true);
            dv.setFloat32(20 * i + 16, v[1][1], true);
        }

        this.vao = gl.createVertexArray()!;
        gl.bindVertexArray(this.vao);

        this.vbo = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.STATIC_DRAW);

        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 20, 0);
        gl.enableVertexAttribArray(0);

        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 20, 3 * 4);
        gl.enableVertexAttribArray(1);

        this.matrixBuffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.matrixBuffer);
        // mat4 attribute takes 4 separate attribute slots, row by row.
        for (let i = 0; i < 4; i++) {
            let loc = 2 + i;
            gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 4 * 16, i * 16);
            gl.vertexAttribDivisor(loc, 1);
            gl.enableVertexAttribArray(loc);
        }
    }

    public render(
        gl: WebGL2RenderingContext,
        node: DeepReadonly<MaterialNode>,
        inputTextures: ReadonlyMap<string, WebGLTexture>,
    ): void {
        this.shaderProgram.bind();

        for (const [id, texture] of inputTextures.entries()) {
            this.shaderProgram.setInputTexture(id, texture);
        }

        this.shaderProgram.bind();

        const numInstances = Math.round(node.parameters["amount"] as number);
        const matrixData = new Float32Array(numInstances * (4 * 4));

        const randomnessSeed = node.parameters["seed"] as number;
        const size = (node.parameters["size"] as number) * 2048;
        const spreadX = node.parameters["spreadX"] as number;
        const spreadY = node.parameters["spreadY"] as number;
        const randomRotation = node.parameters["randomRotation"] as number;
        const randomScale = (node.parameters["randomScale"] as number) / 2048;

        const rng = seedrandom.alea(randomnessSeed.toString());

        for (let instanceIndex = 0; instanceIndex < numInstances; instanceIndex++) {
            const matrix = glMatrix.mat4.create();
            const scale = size / 2048 + rng() * randomScale - randomScale / 2;

            glMatrix.mat4.identity(matrix);
            glMatrix.mat4.fromRotationTranslationScale(
                matrix,
                glMatrix.quat.fromEuler(glMatrix.quat.create(), 0, 0, rng() * randomRotation),
                [rng() * spreadX - spreadX / 2, rng() * spreadY - spreadY / 2, 0],
                [scale, scale, 1],
            );
            matrixData.set(matrix, instanceIndex * 16);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.matrixBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, matrixData, gl.DYNAMIC_DRAW);

        gl.bindVertexArray(this.vao);
        gl.enable(gl.BLEND);

        const blendingMode = node.parameters["blendMode"];
        switch (blendingMode) {
            case BlendMode.Add:
                gl.blendFunc(gl.SRC_COLOR, gl.DST_COLOR);
                gl.blendEquation(gl.FUNC_ADD);
                break;
            case BlendMode.Subtract:
                gl.blendFunc(gl.SRC_COLOR, gl.DST_COLOR);
                gl.blendEquation(gl.FUNC_SUBTRACT);
                break;
            case 255:
                gl.disable(gl.BLEND);
                break;
        }

        gl.drawBuffers(node.spec!.outputSockets.map((_, i) => gl.COLOR_ATTACHMENT0 + i));
        gl.drawArraysInstanced(gl.TRIANGLES, 0, QUAD_VERTICES.length, numInstances);
        gl.disable(gl.BLEND);

        this.shaderProgram.reset();
    }
}

import * as glMatrix from "gl-matrix";
import MaterialNodePainter from "./painter";
import BlendMode from "../../../types/blend-mode";
import MaterialNodeShaderProgram from "../node-shader";
import { MaterialNodeSnapshot } from "../../types";

const FRAGMENT_SHADER_CODE = `
#version 300 es
precision highp float;

in vec2 v_texCoord;
flat in int v_instanceId;

uniform sampler2D i_shape;
uniform int x_instancesCount;

out vec4 out_color;

void main(void) {
    out_color = texture(i_shape, v_texCoord);
    out_color.a = 1.0;
}`;

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

export type PatternElement = {
    rotation: number;
    position: [number, number, number];
    scale: [number, number];
};

export default abstract class PatternMaterialNodePainter implements MaterialNodePainter {
    private readonly shaderProgram: MaterialNodeShaderProgram;
    private readonly matrixBuffer: WebGLBuffer;
    private readonly vao: WebGLVertexArrayObject;
    private readonly vbo: WebGLBuffer;

    constructor(gl: WebGL2RenderingContext) {
        this.shaderProgram = new MaterialNodeShaderProgram(
            gl,
            `
        #version 300 es
        precision highp float;

        in vec3 a_position;
        in vec2 a_texCoord;
        in mat4 i_transformMatrix;
        
        out vec2 v_texCoord;
        flat out int v_instanceId;
        
        void main(void) {
            gl_Position = i_transformMatrix * vec4(a_position, 1);
            v_texCoord = a_texCoord;
            v_instanceId = gl_InstanceID;
        }
        `.trim(),
            FRAGMENT_SHADER_CODE.trim(),
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
            const loc = 2 + i;
            gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 4 * 16, i * 16);
            gl.vertexAttribDivisor(loc, 1);
            gl.enableVertexAttribArray(loc);
        }
    }

    public render(
        gl: WebGL2RenderingContext,
        node: MaterialNodeSnapshot,
        inputTextures: ReadonlyMap<string, WebGLTexture>,
    ): void {
        this.shaderProgram.bind();

        for (const [id, texture] of inputTextures.entries()) {
            this.shaderProgram.setInputTexture(id, texture);
        }

        this.shaderProgram.bind();

        const pattern = this.generatePattern(node);

        const matrixData = new Float32Array(pattern.length * (4 * 4));

        for (let i = 0; i < pattern.length; i++) {
            const element = pattern[i];
            const matrix = glMatrix.mat4.fromRotationTranslationScale(
                glMatrix.mat4.create(),
                glMatrix.quat.fromEuler(glMatrix.quat.create(), 0, 0, element.rotation),
                element.position,
                [element.scale[0], element.scale[1], 0],
            );
            matrixData.set(matrix, i * 16);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.matrixBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, matrixData, gl.DYNAMIC_DRAW);

        this.shaderProgram.setUniformInt("x_instancesCount", pattern.length);

        gl.bindVertexArray(this.vao);
        gl.enable(gl.BLEND);

        const blendingMode = node.node.parameters["blendMode"];
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
            default:
                gl.blendFunc(gl.ONE, gl.ONE);
                gl.blendEquation(gl.FUNC_ADD);
                break;
        }

        gl.drawBuffers(Object.keys(node.blueprint.outputs).map((_, i) => gl.COLOR_ATTACHMENT0 + i));
        gl.drawArraysInstanced(gl.TRIANGLES, 0, QUAD_VERTICES.length, pattern.length);
        gl.disable(gl.BLEND);

        this.shaderProgram.reset();
    }

    public abstract generatePattern(node: MaterialNodeSnapshot): Array<PatternElement>;
}

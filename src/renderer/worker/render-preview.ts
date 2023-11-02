import { Material, MaterialNodeOutputTarget, isOutputNodePath } from "../../types/material";
import createAndCompileShader from "../../utils/createAndCompileShader";
import pbrFragmentShader from "./pbr.fragment.glsl?raw";
import pbrVertexShader from "./pbr.vertex.glsl?raw";

// Position + UV of a fullscreen quad along XZ axis.
const xzQuadVertices = [
    [
        [-0.5, 0, 0.5],
        [0, 0],
    ],
    [
        [0.5, 0, 0.5],
        [1, 0],
    ],
    [
        [0.5, 0, -0.5],
        [1, 1],
    ],
    [
        [-0.5, 0, 0.5],
        [0, 0],
    ],
    [
        [0.5, 0, -0.5],
        [1, 1],
    ],
    [
        [-0.5, 0, -0.5],
        [0, 1],
    ],
];

let canvas: OffscreenCanvas;
let vao: WebGLVertexArrayObject;
let vbo: WebGLBuffer;
let shaderProgram: WebGLProgram;
let viewProjectionUniformLoc: WebGLUniformLocation;

export function initializePreviewRendererResources(
    _canvas: OffscreenCanvas,
    gl: WebGL2RenderingContext,
) {
    canvas = _canvas;
    initializeShaderProgram(gl);
    initializeVBO(gl);
    initializeVAO(gl);
}

function initializeShaderProgram(gl: WebGL2RenderingContext) {
    const program = gl.createProgram();
    if (!program) {
        throw new Error(`Failed to create preview shader program: ${gl.getError()}`);
    }

    const vertexShader = createAndCompileShader(gl, gl.VERTEX_SHADER, pbrVertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        throw new Error(
            `Failed to compile preview vertex shader:\n${gl.getShaderInfoLog(vertexShader)}`,
        );
    }

    const fragmentShader = createAndCompileShader(gl, gl.FRAGMENT_SHADER, pbrFragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        throw new Error(
            `Failed to compile preview fragment shader:\n${gl.getShaderInfoLog(fragmentShader)}`,
        );
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(`Failed to link preview shader program:\n${gl.getProgramInfoLog(program)}`);
    }

    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    const viewProjectionLoc = gl.getUniformLocation(program, "u_viewProjection");
    if (!viewProjectionLoc) {
        throw new Error("Preview shader program does not contain the 'u_viewProjection' uniform.");
    }

    shaderProgram = program;
    viewProjectionUniformLoc = viewProjectionLoc;
}

function initializeVBO(gl: WebGL2RenderingContext) {
    const buffer = gl.createBuffer();
    if (!buffer) {
        throw new Error(`Failed to create preview vertex buffer object: ${gl.getError()}`);
    }

    const dv = new DataView(new ArrayBuffer(20 * xzQuadVertices.length));
    for (let i = 0; i < xzQuadVertices.length; i++) {
        const v = xzQuadVertices[i];
        dv.setFloat32(20 * i, v[0][0], true);
        dv.setFloat32(20 * i + 4, v[0][1], true);
        dv.setFloat32(20 * i + 8, v[0][2], true);
        dv.setFloat32(20 * i + 12, v[1][0], true);
        dv.setFloat32(20 * i + 16, v[1][1], true);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, dv.buffer, gl.STATIC_DRAW);

    vbo = buffer;
}

function initializeVAO(gl: WebGL2RenderingContext) {
    const array = gl.createVertexArray();
    if (!array) {
        throw new Error(`Failed to create preview vertex array object: ${gl.getError()}`);
    }

    gl.bindVertexArray(array);

    // vec3 position
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 3 * 4 + 2 * 4, 0);
    gl.enableVertexAttribArray(0);

    // vec2 uv
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 3 * 4 + 2 * 4, 3 * 4);
    gl.enableVertexAttribArray(1);

    vao = array;
}

/**
 * Finds all output nodes within given material and binds their output textures
 * for use by the shader.
 *
 * @param gl
 * @param textures
 * @param material
 */
function bindOutputTextures(
    gl: WebGL2RenderingContext,
    textures: Map<string, WebGLTexture>,
    material: Material,
) {
    const outputNodes = material.nodes.filter((node) => isOutputNodePath(node.path));
    [MaterialNodeOutputTarget.Albedo, MaterialNodeOutputTarget.Height].forEach((target, index) => {
        const outputNode = outputNodes.find((node) => node.parameters["target"] == target);
        if (outputNode) {
            const texture = textures.get(`${outputNode.id}-output`);
            if (texture) {
                const location = gl.getUniformLocation(shaderProgram, "i_" + target);
                if (location) {
                    gl.activeTexture(gl.TEXTURE0 + index);
                    gl.bindTexture(gl.TEXTURE_2D, texture);
                    gl.uniform1i(location, index);
                }
            }
        }
    });
}

export function renderPreview(
    gl: WebGL2RenderingContext,
    textures: Map<string, WebGLTexture>,
    material: Material,
    viewProjection: Float32Array,
) {
    gl.useProgram(shaderProgram);
    gl.uniformMatrix4fv(viewProjectionUniformLoc, false, viewProjection);

    bindOutputTextures(gl, textures, material);

    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.1, 0.1, 0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, xzQuadVertices.length);
}

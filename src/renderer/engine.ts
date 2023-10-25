import {NodeRenderJobInfo, PreviewRenderJobInfo, RenderJobInfo,} from "./job.ts";
import {getBuiltinNodeFragmentShader} from "../nodes";
import {MaterialNodeOutputTarget, MaterialNodeParametersMap, MaterialNodeType,} from "../types/material.ts";
import MaterialNodeShaderProgram from "./program.ts";
import {MaterialNodeOutputBitmap} from "./output.ts";
import pbrVertexShader from "./pbr.vertex.glsl?raw";
import pbrFragmentShader from "./pbr.fragment.glsl?raw";
import PreviewShaderProgram from "./preview-program.ts";
import PreviewCameraController from "../preview/camera.ts";

/**
 * Nodes and the preview are rendered using the same offscreen context to avoid copying textures.
 */
export default class RenderingEngine {
    private readonly canvas: OffscreenCanvas;
    private readonly gl: WebGL2RenderingContext;
    private readonly emptyTextureData: Uint8Array;
    private readonly textureCache = new Map<string, WebGLTexture>();
    private readonly shaderProgramCache = new Map<
        string,
        MaterialNodeShaderProgram
    >();
    private lastPreviewShaderProgram?: PreviewShaderProgram;
    private previewCamera = new PreviewCameraController();

    constructor(outputWidth: number, outputHeight: number) {
        this.canvas = new OffscreenCanvas(outputWidth, outputHeight);
        this.gl = this.canvas.getContext("webgl2", {
            antialias: false,
        })!;
        this.gl.viewport(0, 0, outputWidth, outputHeight);
        this.gl.clearColor(0, 0, 0, 1);
        this.emptyTextureData = new Uint8Array(outputWidth * outputHeight * 4);
    }

    public runJob(job: RenderJobInfo) {
        if (job.type === "node") {
            this.runNodeRenderJob(job);
        } else if (job.type === "preview") {
            this.runPreviewRenderJob(job);
        }
    }

    private runNodeRenderJob(job: NodeRenderJobInfo) {
        const fragmentShader = getBuiltinNodeFragmentShader(job.node.type);
        if (!fragmentShader) {
            throw new Error(
                `No fragment shader was found for node ${job.node.id}.`,
            );
        }

        const parameters: MaterialNodeParametersMap = {};
        for (const parameter of job.info.parameters) {
            parameters[parameter.id] = job.node.parameters[parameter.id];
        }

        const fbo = this.gl.createFramebuffer()!;
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fbo);

        // Prepare an empty texture for each output.
        for (let i = 0; i < job.info.outputSockets.length; i++) {
            const cachePath = this.getTextureCachePath(
                job.node.id,
                job.info.outputSockets[i].id,
            );
            let texture: WebGLTexture;
            if (this.textureCache.has(cachePath)) {
                texture = this.textureCache.get(cachePath)!;
                this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
            } else {
                texture = this.gl.createTexture()!;
                this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
                this.gl.texImage2D(
                    this.gl.TEXTURE_2D,
                    0,
                    this.gl.RGBA,
                    this.canvas.width,
                    this.canvas.height,
                    0,
                    this.gl.RGBA,
                    this.gl.UNSIGNED_BYTE,
                    this.emptyTextureData,
                );
                this.gl.texParameterf(
                    this.gl.TEXTURE_2D,
                    this.gl.TEXTURE_MAG_FILTER,
                    this.gl.LINEAR,
                );
                this.gl.texParameteri(
                    this.gl.TEXTURE_2D,
                    this.gl.TEXTURE_MIN_FILTER,
                    this.gl.LINEAR,
                );
                this.textureCache.set(cachePath, texture);
            }

            this.gl.framebufferTexture2D(
                this.gl.FRAMEBUFFER,
                this.gl.COLOR_ATTACHMENT0 + i,
                this.gl.TEXTURE_2D,
                texture,
                0,
            );
        }

        this.gl.bindTexture(this.gl.TEXTURE_2D, null);

        let shader: MaterialNodeShaderProgram;
        if (this.shaderProgramCache.has(fragmentShader)) {
            shader = this.shaderProgramCache.get(fragmentShader)!;
        } else {
            shader = new MaterialNodeShaderProgram(this.gl, fragmentShader);
            this.shaderProgramCache.set(fragmentShader, shader);
        }

        shader.setParameters(parameters);

        for (const input of job.info.inputSockets) {
            const connection = job.material.connections.find(
                (x) =>
                    x.to.nodeId === job.node.id && x.to.socketId === input.id,
            );
            if (connection) {
                const textureCachePath = this.getTextureCachePath(
                    connection.from.nodeId,
                    connection.from.socketId,
                );
                const texture = this.textureCache.get(textureCachePath);
                if (texture) {
                    shader.setInputTexture(input.id, texture);
                } else {
                    console.warn(
                        `Texture for input socket '${input.id}' of node '${job.node.label}' has not been rendered yet.`,
                    );
                }
            }
        }

        shader.bind();

        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.drawBuffers(
            job.info.outputSockets.map((_, i) => this.gl.COLOR_ATTACHMENT0 + i),
        );
        this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, 3);

        shader.reset();

        this.gl.bindFramebuffer(this.gl.READ_FRAMEBUFFER, fbo);
        this.gl.bindFramebuffer(this.gl.DRAW_FRAMEBUFFER, null);

        // Copy contents of each color attachment to the main framebuffer and
        // then store it in an ImageBitmap.
        const outputBitmaps = new Map<string, MaterialNodeOutputBitmap>();
        for (let i = 0; i < job.info.outputSockets.length; i++) {
            this.gl.readBuffer(this.gl.COLOR_ATTACHMENT0 + i);
            this.gl.blitFramebuffer(
                0,
                0,
                this.canvas.width,
                this.canvas.height,
                0,
                0,
                this.canvas.width,
                this.canvas.height,
                this.gl.COLOR_BUFFER_BIT,
                this.gl.LINEAR,
            );

            const name = job.info.outputSockets[i].id;
            outputBitmaps.set(name, {
                name,
                bitmap: this.canvas.transferToImageBitmap(),
            });
        }

        this.gl.deleteFramebuffer(fbo);

        job.result.resolve(outputBitmaps);
    }

    private runPreviewRenderJob(job: PreviewRenderJobInfo) {
        const shader =
            this.lastPreviewShaderProgram ??
            new PreviewShaderProgram(
                this.gl,
                pbrVertexShader,
                pbrFragmentShader,
            );
        this.lastPreviewShaderProgram = shader;
        shader.bind();
        shader.setCamera(this.previewCamera);

        [
            MaterialNodeOutputTarget.Albedo,
            MaterialNodeOutputTarget.Normal,
        ].forEach((target, index) => {
            const outputNode = job.material.nodes.find(
                (node) =>
                    node.type === MaterialNodeType.Output &&
                    node.parameters["target"] == target,
            );

            if (!outputNode) {
                return;
            }

            const texture = this.textureCache.get(
                this.getTextureCachePath(outputNode.id, "output"),
            );

            if (!texture) {
                return;
            }

            const location = this.gl.getUniformLocation(
                shader.getProgram(),
                "i_" + target,
            );

            if (location) {
                this.gl.activeTexture(this.gl.TEXTURE0 + index);
                this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
                this.gl.uniform1i(location, index);
            }
        });

        const vertices = [
            [
                [-1, 0, -1],
                [0, 0],
            ],
            [
                [1, 0, -1],
                [1, 0],
            ],
            [
                [-1, 0, 1],
                [0, 1],
            ],

            [
                [1, 0, -1],
                [1, 0],
            ],
            [
                [-1, 0, 1],
                [0, 1],
            ],

            [
                [1, 0, 1],
                [1, 1],
            ],
        ];

        const buffer = new ArrayBuffer(20 * vertices.length);
        const dv = new DataView(buffer);
        for (let i = 0; i < vertices.length; i++) {
            const v = vertices[i];
            dv.setFloat32(20 * i, v[0][0], true);
            dv.setFloat32(20 * i + 4, v[0][1], true);
            dv.setFloat32(20 * i + 8, v[0][2], true);
            dv.setFloat32(20 * i + 12, v[1][0], true);
            dv.setFloat32(20 * i + 16, v[1][1], true);
        }

        const vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(vao);
        const vbo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, buffer, this.gl.STATIC_DRAW);

        this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 20, 0);
        this.gl.enableVertexAttribArray(0);

        this.gl.vertexAttribPointer(1, 2, this.gl.FLOAT, false, 20, 3 * 4);
        this.gl.enableVertexAttribArray(1);

        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, vertices.length);

        this.gl.deleteBuffer(vbo);
        this.gl.deleteVertexArray(vao);

        job.result.resolve(this.canvas.transferToImageBitmap());
    }

    private getTextureCachePath(nodeId: number, socketId: string) {
        return nodeId + "_" + socketId;
    }

    public getPreviewCameraController() {
        return this.previewCamera;
    }
}

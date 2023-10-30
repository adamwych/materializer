import { createContextProvider } from "@solid-primitives/context";
import { useMaterialContext } from "../editor/material-context";
import { MaterialNode, MaterialNodeOutputTarget, isOutputNodePath } from "../types/material";
import { createSignal } from "solid-js";
import PreviewShaderProgram from "./preview-program";
import pbrVertexShader from "./pbr.vertex.glsl?raw";
import pbrFragmentShader from "./pbr.fragment.glsl?raw";
import PreviewCameraController from "../editor/preview/camera";
import { ReactiveMap } from "@solid-primitives/map";
import MaterialNodePainter, { MaterialNodePainterType } from "./painters/painter";
import GLSLMaterialNodePainter from "./painters/glsl";
import ScatterMaterialNodePainter from "./painters/scatter";
import TileMaterialNodePainter from "./painters/tile";

type NodeBitmapStorageEntry = {
    bitmap?: ImageBitmap;
};

export const [RenderingEngineProvider, useRenderingEngine] = createContextProvider(() => {
    const materialCtx = useMaterialContext()!;
    const canvas = new OffscreenCanvas(
        materialCtx.getOutputTextureWidth(),
        materialCtx.getOutputTextureHeight(),
    );
    const emptyTextureData = new Uint8Array(canvas.width * canvas.height * 4);
    const gl = canvas.getContext("webgl2", {
        antialias: false,
    })!;
    const textures = new Map<string, WebGLTexture>();
    const painters = new Map<number, MaterialNodePainter>();
    const bitmaps = new ReactiveMap<string, NodeBitmapStorageEntry>();
    const previewCamera = new PreviewCameraController();
    const [previewTexture, setPreviewTexture] = createSignal<ImageBitmap>();

    materialCtx.events.on("removed", (node) => {
        node.spec?.outputSockets.forEach((output) => {
            textures.delete(`${node.id}-${output.id}`);
        });
    });

    function createFramebuffer(node: MaterialNode) {
        const fbo = gl.createFramebuffer()!;
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

        for (let i = 0; i < node.spec!.outputSockets.length; i++) {
            let texture = createOrGetOutputTexture(node.id, node.spec!.outputSockets[i].id);
            gl.framebufferTexture2D(
                gl.FRAMEBUFFER,
                gl.COLOR_ATTACHMENT0 + i,
                gl.TEXTURE_2D,
                texture,
                0,
            );
        }

        return fbo;
    }

    function createOrGetOutputTexture(nodeId: number, outputId: string) {
        const key = `${nodeId}-${outputId}`;
        const existingTexture = textures.get(key);
        if (existingTexture) {
            gl.bindTexture(gl.TEXTURE_2D, existingTexture);
            return existingTexture;
        }

        const texture = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            canvas.width,
            canvas.height,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            emptyTextureData,
        );
        gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        textures.set(key, texture);
        return texture;
    }

    function getPainterConstructor(type: MaterialNodePainterType) {
        switch (type) {
            case "glsl":
                return GLSLMaterialNodePainter;
            case "scatter":
                return ScatterMaterialNodePainter;
            case "tile":
                return TileMaterialNodePainter;
        }
    }

    return {
        renderNode(nodeId: number) {
            const node = materialCtx.getNodeById(nodeId);
            if (!node || !node.spec) {
                throw new Error(`Cannot run render job: Node does not exist.`);
            }

            if (node.spec.outputSockets.length === 0) {
                throw new Error(`Cannot run render job: Node has no outputs.`);
            }

            if (!painters.has(node.id)) {
                const painterCtor = getPainterConstructor(node.spec.painter.type);
                if (!painterCtor) {
                    throw new Error(
                        `Cannot run render job: Painter '${node.spec.painter.type}' it not supported.`,
                    );
                }
                painters.set(node.id, new painterCtor(gl, node.spec.painter));
            }

            const fbo = createFramebuffer(node);

            const inputTextures = new Map<string, WebGLTexture>();
            for (const input of node.spec.inputSockets) {
                const connection = materialCtx
                    .getSocketConnections()
                    .find((x) => x.to.nodeId === node.id && x.to.socketId === input.id);
                if (connection) {
                    const textureCachePath = `${connection.from.nodeId}-${connection.from.socketId}`;
                    const texture = textures.get(textureCachePath);
                    if (texture) {
                        inputTextures.set(input.id, texture);
                    } else {
                        console.warn(
                            `Texture for input socket '${input.id}' of node '${node.label}' has not been rendered yet.`,
                        );
                    }
                }
            }

            gl.bindTexture(gl.TEXTURE_2D, null);

            gl.enable(gl.DEPTH_TEST);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0, 0, 0, 1);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            const painter = painters.get(node.id)!;
            painter.render(gl, node, inputTextures);

            gl.bindFramebuffer(gl.READ_FRAMEBUFFER, fbo);
            gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);

            for (let i = 0; i < node.spec.outputSockets.length; i++) {
                gl.readBuffer(gl.COLOR_ATTACHMENT0 + i);
                gl.blitFramebuffer(
                    0,
                    0,
                    canvas.width,
                    canvas.height,
                    0,
                    0,
                    canvas.width,
                    canvas.height,
                    gl.COLOR_BUFFER_BIT,
                    gl.LINEAR,
                );

                const key = `${node.id}-${node.spec.outputSockets[i].id}`;
                bitmaps.set(key, {
                    bitmap: canvas.transferToImageBitmap(),
                });
            }

            gl.deleteFramebuffer(fbo);
        },

        renderPreview() {
            const shader = new PreviewShaderProgram(gl, pbrVertexShader, pbrFragmentShader);
            shader.bind();
            shader.setCamera(previewCamera);

            [MaterialNodeOutputTarget.Albedo, MaterialNodeOutputTarget.Height].forEach(
                (target, index) => {
                    const outputNode = materialCtx
                        .getNodes()
                        .find(
                            (node) =>
                                isOutputNodePath(node.path) && node.parameters["target"] == target,
                        );
                    if (!outputNode) {
                        return;
                    }

                    const texture = textures.get(`${outputNode.id}-output`);
                    if (!texture) {
                        return;
                    }

                    const location = gl.getUniformLocation(shader.getProgram(), "i_" + target);

                    if (location) {
                        gl.activeTexture(gl.TEXTURE0 + index);
                        gl.bindTexture(gl.TEXTURE_2D, texture);
                        gl.uniform1i(location, index);
                    }
                },
            );

            const vertices = [
                [
                    [0, 0, 0],
                    [0, 0],
                ],
                [
                    [1, 0, 0],
                    [1, 0],
                ],
                [
                    [1, 0, -1],
                    [1, 1],
                ],

                [
                    [0, 0, 0],
                    [0, 0],
                ],
                [
                    [1, 0, -1],
                    [1, 1],
                ],
                [
                    [0, 0, -1],
                    [0, 1],
                ],
            ];

            const buffer = new ArrayBuffer(20 * vertices.length);
            const dv = new DataView(buffer);
            for (let i = 0; i < vertices.length; i++) {
                const v = vertices[i];
                dv.setFloat32(20 * i, v[0][0] - 0.5, true);
                dv.setFloat32(20 * i + 4, v[0][1], true);
                dv.setFloat32(20 * i + 8, v[0][2] + 0.5, true);
                dv.setFloat32(20 * i + 12, v[1][0], true);
                dv.setFloat32(20 * i + 16, v[1][1], true);
            }

            const vao = gl.createVertexArray();
            gl.bindVertexArray(vao);
            const vbo = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
            gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.STATIC_DRAW);

            gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 20, 0);
            gl.enableVertexAttribArray(0);

            gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 20, 3 * 4);
            gl.enableVertexAttribArray(1);

            gl.clearColor(0.1, 0.1, 0.1, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, vertices.length);

            gl.deleteBuffer(vbo);
            gl.deleteVertexArray(vao);

            setPreviewTexture(canvas.transferToImageBitmap());
        },

        getNodeBitmap(nodeId: number, socketId: string) {
            const key = `${nodeId}-${socketId}`;
            if (!bitmaps.has(key)) {
                bitmaps.set(key, {
                    bitmap: undefined,
                });
            }
            return () => bitmaps.get(key);
        },

        previewTexture,
        previewCamera,
    };
});

import { Material, MaterialNode } from "../../types/material";
import TextureFilterMethod from "../../types/texture-filter";
import { ConstructorOf } from "../../types/utils";
import GLSLMaterialNodePainter from "../painters/glsl";
import MaterialNodePainter, { MaterialNodePainterType } from "../painters/painter";
import ScatterMaterialNodePainter from "../painters/scatter";
import TileMaterialNodePainter from "../painters/tile";

const painters = new Map<number, MaterialNodePainter>();
const painterCtors = new Map<MaterialNodePainterType, ConstructorOf<MaterialNodePainter>>([
    ["glsl", GLSLMaterialNodePainter],
    ["scatter", ScatterMaterialNodePainter],
    ["tile", TileMaterialNodePainter],
]);

let canvas: OffscreenCanvas;
let emptyTextureData: Uint8Array;

export function initializeNodeRendererResources(_canvas: OffscreenCanvas) {
    canvas = _canvas;
    emptyTextureData = new Uint8Array(canvas.width * canvas.height * 3);
}

export function clearNodeCache(nodeId: number) {
    painters.delete(nodeId);
}

function mapTextureFilterToGL(method: TextureFilterMethod) {
    return method === TextureFilterMethod.Linear ? 0x2601 : 0x2600;
}

/**
 * Generates a framebuffer object for given node.
 * All output textures will also be generated and bound.
 *
 * @param node
 * @returns
 */
function createFramebuffer(
    gl: WebGL2RenderingContext,
    material: Material,
    node: MaterialNode,
    textures: Map<string, WebGLTexture>,
    width: number,
    height: number,
) {
    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

    node.spec!.outputSockets.forEach((socket, index) => {
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0 + index,
            gl.TEXTURE_2D,
            bindOutputSocketTexture(gl, material, textures, node.id, socket.id, width, height),
            0,
        );
    });

    return fbo;
}

/**
 * Retrieves and binds the texture for an output socket of a node.
 * If there's no texture associated with this specific socket in
 * the cache, an empty black texture will be generated and returned.
 *
 * @param nodeId
 * @param outputId
 * @returns
 */
function bindOutputSocketTexture(
    gl: WebGL2RenderingContext,
    material: Material,
    textures: Map<string, WebGLTexture>,
    nodeId: number,
    outputId: string,
    width: number,
    height: number,
) {
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
        gl.RGB,
        width,
        height,
        0,
        gl.RGB,
        gl.UNSIGNED_BYTE,
        emptyTextureData,
    );
    gl.texParameterf(
        gl.TEXTURE_2D,
        gl.TEXTURE_MAG_FILTER,
        mapTextureFilterToGL(material.textureFiltering),
    );
    gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MIN_FILTER,
        mapTextureFilterToGL(material.textureFiltering),
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    textures.set(key, texture);
    return texture;
}

export function renderNode(
    gl: WebGL2RenderingContext,
    material: Material,
    node: MaterialNode,
    textures: Map<string, WebGLTexture>,
    bitmaps: Map<string, ImageBitmap>,
    textureWidth: number,
    textureHeight: number,
    thumbnailWidth: number,
    thumbnailHeight: number,
) {
    if (!node.spec) {
        return;
    }

    if (node.spec.outputSockets.length === 0) {
        console.error(`Cannot run render job: Node has no outputs.`);
        return;
    }

    if (!painters.has(node.id)) {
        const painterCtor = painterCtors.get(node.spec.painter.type);
        if (!painterCtor) {
            console.error(
                `Cannot run render job: Painter '${node.spec.painter.type}' it not supported.`,
            );
            return;
        }
        painters.set(node.id, new painterCtor(gl, node.spec.painter));
    }

    const fbo = createFramebuffer(gl, material, node, textures, textureWidth, textureHeight);

    const inputTextures = new Map<string, WebGLTexture>();
    for (const input of node.spec.inputSockets) {
        const connection = material.connections.find(
            (x) => x.to.nodeId === node.id && x.to.socketId === input.id,
        );
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

    gl.viewport(0, 0, textureWidth, textureHeight);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const painter = painters.get(node.id)!;
    painter.render(gl, node, inputTextures);

    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, fbo);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);

    const originalCanvasWidth = canvas.width;
    const originalCanvasHeight = canvas.height;
    canvas.width = thumbnailWidth;
    canvas.height = thumbnailHeight;

    for (let i = 0; i < node.spec.outputSockets.length; i++) {
        gl.readBuffer(gl.COLOR_ATTACHMENT0 + i);
        gl.blitFramebuffer(
            0,
            0,
            textureWidth,
            textureHeight,
            0,
            0,
            thumbnailWidth,
            thumbnailHeight,
            gl.COLOR_BUFFER_BIT,
            mapTextureFilterToGL(material.textureFiltering),
        );

        bitmaps.set(`${node.id}-${node.spec.outputSockets[i].id}`, canvas.transferToImageBitmap());
    }

    canvas.width = originalCanvasWidth;
    canvas.height = originalCanvasHeight;

    gl.deleteFramebuffer(fbo);
}

import { MaterialNodePainterInfo, MaterialNodePainterType } from "../../types/node-painter";
import TextureFilterMethod, { mapFilterMethodToGL } from "../../types/texture-filter";
import { ConstructorOf } from "../../utils/ConstructorOf";
import { MaterialNodeSnapshot } from "../types";
import GLSLMaterialNodePainter from "./painters/glsl";
import MaterialNodePainter from "./painters/painter";
import ScatterMaterialNodePainter from "./painters/scatter";
import TileMaterialNodePainter from "./painters/tile";

const PAINTER_CTORS: Record<MaterialNodePainterType, ConstructorOf<MaterialNodePainter>> = {
    glsl: GLSLMaterialNodePainter,
    scatter: ScatterMaterialNodePainter,
    tile: TileMaterialNodePainter,
};

export type NodeTextureInfo = {
    texture: WebGLTexture;
    width: number;
    height: number;
};

export default class WebGLNodeRenderer {
    private fbo: WebGLFramebuffer;
    private readonly textures = new Map<number, NodeTextureInfo>();
    private readonly painters = new Map<number, MaterialNodePainter>();

    constructor(
        private readonly canvas: OffscreenCanvas,
        private readonly gl: WebGL2RenderingContext,
    ) {
        this.fbo = gl.createFramebuffer()!;
    }

    public clearNodeCache(nodeId: number) {
        const texture = this.textures.get(nodeId);
        if (texture) {
            this.gl.deleteTexture(texture);
        }

        this.textures.delete(nodeId);
        this.painters.delete(nodeId);
    }

    private createNodeOutputTexture(nodeId: number, width: number, height: number): WebGLTexture {
        const existingTexture = this.textures.get(nodeId);
        if (existingTexture) {
            return existingTexture.texture;
        }

        const texture = this.createEmptyTexture(
            width,
            height,
            TextureFilterMethod.Linear,
            false,
            false,
        );

        this.textures.set(nodeId, { texture, width, height });
        return texture;
    }

    public render(nodeSnapshot: MaterialNodeSnapshot) {
        const gl = this.gl;
        const { node, blueprint } = nodeSnapshot;

        // Output nodes mirror connected input, so there's no need to render them too.
        if (node.path === "materializer/output") {
            const connectedInput = nodeSnapshot.inputs.get("color");
            if (connectedInput) {
                const inputTexture = this.textures.get(connectedInput[0]);
                if (inputTexture) {
                    this.textures.set(node.id, inputTexture);
                }
            }

            return;
        }

        const painter = this.getNodePainter(node.id, blueprint.painter);
        if (!painter) {
            console.error(
                `Painter '${blueprint.painter.type}' required by node '${node.name}' was not found.`,
            );

            return;
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);

        // Attach all output textures that this node defines to the framebuffer.
        // For simplicity all sockets use the same texture format and size, but
        // in the future it should be possible to change those per-socket.
        Object.values(blueprint.outputs).forEach((_, index) => {
            const texture = this.createNodeOutputTexture(
                node.id,
                node.textureSize,
                node.textureSize,
            );

            gl.framebufferTexture2D(
                gl.FRAMEBUFFER,
                gl.COLOR_ATTACHMENT0 + index,
                gl.TEXTURE_2D,
                texture,
                0,
            );
        });

        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.viewport(0, 0, node.textureSize, node.textureSize);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Collect a map containing references to input textures.
        const inputTextures = new Map<string, WebGLTexture | null>();
        Object.keys(nodeSnapshot.blueprint.inputs).forEach((socketId) => {
            const connectedInput = nodeSnapshot.inputs.get(socketId);
            if (connectedInput) {
                inputTextures.set(socketId, this.getNodeOutputTexture(connectedInput[0])!);
            } else {
                inputTextures.set(socketId, null);
            }
        });

        painter.render(this.gl, nodeSnapshot, inputTextures);

        // Restore default framebuffer.
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    /**
     * Renders and retrieves node's texture pixel data.
     * If this node has been rendered before, it will not be re-rendered.
     *
     * This function supports resizing output image to specific dimensions
     * using linear and nearest filters, but note that it simply
     * resizes the final image, it does not re-render the node!
     *
     * @param nodeSnapshot Node to render.
     * @param outputWidth Width of the output image.
     * @param outputHeight Height of the output image.
     * @param filterMethod Filter to use when resizing.
     */
    public renderToImageData(
        nodeSnapshot: MaterialNodeSnapshot,
        outputWidth?: number,
        outputHeight?: number,
        filterMethod = TextureFilterMethod.Linear,
    ): ImageData {
        const gl = this.gl;
        const { node } = nodeSnapshot;

        let texture = this.textures.get(node.id);
        if (!texture) {
            this.render(nodeSnapshot);
            texture = this.textures.get(node.id)!;
        }

        outputWidth = outputWidth ?? texture.width;
        outputHeight = outputHeight ?? texture.height;

        const outputFramebuffer = gl.createFramebuffer()!;

        // Up-scale/down-scale the texture if necessary.
        if (texture.width !== outputWidth || texture.height !== outputHeight) {
            const outputTexture = this.createEmptyTexture(
                outputWidth,
                outputHeight,
                filterMethod,
                false,
                false,
            );

            const sourceFramebuffer = gl.createFramebuffer()!;
            gl.bindFramebuffer(gl.READ_FRAMEBUFFER, sourceFramebuffer);
            gl.framebufferTexture2D(
                gl.READ_FRAMEBUFFER,
                gl.COLOR_ATTACHMENT0,
                gl.TEXTURE_2D,
                texture.texture,
                0,
            );

            gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, outputFramebuffer);
            gl.framebufferTexture2D(
                gl.DRAW_FRAMEBUFFER,
                gl.COLOR_ATTACHMENT0,
                gl.TEXTURE_2D,
                outputTexture,
                0,
            );

            gl.viewport(0, 0, outputWidth, outputHeight);

            const [previousCanvasWidth, previousCanvasHeight] = [
                this.canvas.width,
                this.canvas.height,
            ];

            // Temporarily resize the canvas to enlarge the backbuffer in case the output
            // texture must be upscaled past its current dimensions.
            this.canvas.width = outputWidth;
            this.canvas.height = outputHeight;

            gl.blitFramebuffer(
                0,
                0,
                texture.width,
                texture.height,
                0,
                0,
                outputWidth,
                outputHeight,
                gl.COLOR_BUFFER_BIT,
                filterMethod === TextureFilterMethod.Linear ? gl.LINEAR : gl.NEAREST,
            );

            this.canvas.width = previousCanvasWidth;
            this.canvas.height = previousCanvasHeight;
        } else {
            gl.framebufferTexture2D(
                gl.FRAMEBUFFER,
                gl.COLOR_ATTACHMENT0,
                gl.TEXTURE_2D,
                texture.texture,
                0,
            );
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, outputFramebuffer);

        const pixels = new Uint8Array(outputWidth * outputHeight * 4);
        this.gl.readBuffer(this.gl.COLOR_ATTACHMENT0);
        this.gl.readPixels(
            0,
            0,
            outputWidth,
            outputHeight,
            this.gl.RGBA,
            this.gl.UNSIGNED_BYTE,
            pixels,
        );

        // Restore default framebuffer.
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.deleteFramebuffer(outputFramebuffer);

        return new ImageData(new Uint8ClampedArray(pixels), outputWidth, outputHeight);
    }

    /**
     * Creates an empty texture.
     *
     * @param width Width of the texture.
     * @param height Height of the texture.
     * @param filter Filter method used by the texture.
     * @param rgba Whether this texture should have an alpha channel.
     * @param repeat Whether this texture should repeat when wrapping.
     */
    private createEmptyTexture(
        width: number,
        height: number,
        filter: TextureFilterMethod,
        rgba: boolean,
        repeat: boolean,
    ): WebGLTexture {
        const gl = this.gl;
        const texture = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            rgba ? gl.RGBA : gl.RGB,
            width,
            height,
            0,
            rgba ? gl.RGBA : gl.RGB,
            gl.UNSIGNED_BYTE,
            null,
        );

        gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, mapFilterMethodToGL(filter));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mapFilterMethodToGL(filter));

        if (repeat) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        }

        gl.bindTexture(gl.TEXTURE_2D, null);
        return texture;
    }

    /**
     * Constructs a {@link MaterialNodePainter} for given node or retrieves
     * it from the cache it was has already been constructed before.
     *
     * @param nodeId
     * @param info
     * @returns Constructed painter.
     */
    private getNodePainter(nodeId: number, info: MaterialNodePainterInfo) {
        const existingPainter = this.painters.get(nodeId);
        if (existingPainter) {
            return existingPainter;
        }

        const painterCtor = PAINTER_CTORS[info.type];
        const painter = new painterCtor(this.gl, info);
        this.painters.set(nodeId, painter);
        return painter;
    }

    /**
     * Returns the {@link WebGLTexture} associated with node by given ID.
     * Returns `undefined` if this node has not been rendered, yet.
     *
     * @param nodeId
     */
    public getNodeOutputTexture(nodeId: number) {
        return this.textures.get(nodeId)?.texture;
    }
}

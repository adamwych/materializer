import { MaterialNodePainterInfo } from "../../types/node-painter";
import { RenderableMaterialNodeSnapshot } from "../types";
import GLSLMaterialNodePainter from "./painters/glsl";
import MaterialNodePainter from "./painters/painter";
import ScatterMaterialNodePainter from "./painters/scatter";
import TileMaterialNodePainter from "./painters/tile";

export default class WebGLNodeRenderer {
    private fbo: WebGLFramebuffer;
    private readonly textures = new Map<number, WebGLTexture>();
    private readonly painters = new Map<number, MaterialNodePainter>();
    private readonly blackTexture: WebGLTexture;

    constructor(private readonly gl: WebGL2RenderingContext) {
        this.blackTexture = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, this.blackTexture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGB,
            1,
            1,
            0,
            gl.RGB,
            gl.UNSIGNED_BYTE,
            new Uint8Array(1 * 1 * 3),
        );
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

    private getNodePainter(nodeId: number, info: MaterialNodePainterInfo) {
        const existingPainter = this.painters.get(nodeId);
        if (existingPainter) {
            return existingPainter;
        }

        let painter: MaterialNodePainter;
        if (info.type === "glsl") {
            painter = new GLSLMaterialNodePainter(this.gl, info);
        } else if (info.type === "scatter") {
            painter = new ScatterMaterialNodePainter(this.gl);
        } else if (info.type === "tile") {
            painter = new TileMaterialNodePainter(this.gl);
        }

        this.painters.set(nodeId, painter!);
        return painter!;
    }

    private createNodeOutputTexture(nodeId: number, width: number, height: number): WebGLTexture {
        const gl = this.gl;
        const existingTexture = this.textures.get(nodeId);
        if (existingTexture) {
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
            new Uint8Array(width * height * 3),
        );
        gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, null);
        this.textures.set(nodeId, texture);
        return texture;
    }

    public render(nodeSnapshot: RenderableMaterialNodeSnapshot) {
        const gl = this.gl;
        const { node, blueprint } = nodeSnapshot;
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
        const inputTextures = new Map<string, WebGLTexture>();
        Object.keys(nodeSnapshot.blueprint.inputs).forEach((socketId) => {
            const connectedInput = nodeSnapshot.inputs.get(socketId);
            if (connectedInput) {
                inputTextures.set(socketId, this.getNodeOutputTexture(connectedInput[0])!);
            } else {
                inputTextures.set(socketId, this.blackTexture);
            }
        });

        painter.render(this.gl, nodeSnapshot, inputTextures);

        // Restore default framebuffer.
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    public renderToImageData(nodeSnapshot: RenderableMaterialNodeSnapshot): ImageData {
        const gl = this.gl;
        const { node } = nodeSnapshot;

        this.render(nodeSnapshot);

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);

        const pixels = new Uint8Array(node.textureSize * node.textureSize * 4);
        this.gl.readBuffer(this.gl.COLOR_ATTACHMENT0);
        this.gl.readPixels(
            0,
            0,
            node.textureSize,
            node.textureSize,
            this.gl.RGBA,
            this.gl.UNSIGNED_BYTE,
            pixels,
        );

        // Restore default framebuffer.
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        return new ImageData(new Uint8ClampedArray(pixels), node.textureSize, node.textureSize);
    }

    public getNodeOutputTexture(nodeId: number) {
        return this.textures.get(nodeId);
    }
}

import { MaterialNodeSnapshot } from "../../types";

export type MaterialNodePainterType = "glsl" | "scatter" | "tile";

/**
 * Painter is responsible for drawing a node of certain type onto its output textures.
 */
export default interface MaterialNodePainter {
    render(
        gl: WebGL2RenderingContext,
        node: MaterialNodeSnapshot,
        inputTextures: Map<string, WebGLTexture>,
    ): void;
}

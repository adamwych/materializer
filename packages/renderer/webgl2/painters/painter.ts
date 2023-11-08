import { MaterialNodeSnapshot } from "../../types";

/**
 * Painter is responsible for drawing a node of certain type onto its output textures.
 */
export default interface MaterialNodePainter {
    render(
        gl: WebGL2RenderingContext,
        node: MaterialNodeSnapshot,
        inputTextures: Map<string, WebGLTexture | null>,
    ): void;
}

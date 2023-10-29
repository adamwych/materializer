import { DeepReadonly } from "ts-essentials";
import { MaterialNode } from "../../types/material";

export type MaterialNodePainterType = "glsl" | "scatter";

/**
 * Painter is responsible for drawing a node of certain type onto its output textures.
 */
export default interface MaterialNodePainter {
    render(
        gl: WebGL2RenderingContext,
        node: DeepReadonly<MaterialNode>,
        inputTextures: Map<string, WebGLTexture>,
    ): void;
}

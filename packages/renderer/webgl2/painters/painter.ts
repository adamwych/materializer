import { MaterialNodePainterInfo } from "../../../material/node-painter";
import { WebGLNodePaintContext } from "./context";

/**
 * Painter is responsible for drawing a node of certain type onto its output textures.
 */
export default interface WebGLNodePainter {
    render(context: WebGLNodePaintContext): void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WebGLNodePainterConstructor<T extends MaterialNodePainterInfo = any> = {
    new (gl: WebGL2RenderingContext, info: T): WebGLNodePainter;
};

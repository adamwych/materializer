import { MaterialNodeSnapshot } from "../../types";
import WebGLNodeRenderer from "../node-renderer";

export type WebGLNodePaintContext = {
    /** The renderer that invoked the painter. */
    renderer: WebGLNodeRenderer;

    /** Snapshot of the node that's being rendered. */
    node: MaterialNodeSnapshot;

    /**
     * A map of input textures provided to the node.
     * If a socket is not connected to another node, it will still
     * be present in this map, but the texture will be set to `null`.
     */
    inputTextures: ReadonlyMap<string, WebGLTexture | null>;
};

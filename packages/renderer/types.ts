import { MaterialNode, MaterialNodeBlueprint } from "../types/node";
import { MaterialNodeSocketAddr } from "../types/node-socket";

export type RenderableMaterialSnapshot = {
    nodes: { [k: number]: RenderableMaterialNodeSnapshot };
};

/**
 * All details about a single material node that the worker needs
 * in order to be able to render that node.
 */
export type RenderableMaterialNodeSnapshot = {
    /** The node itself. */
    node: MaterialNode;

    /** Blueprint to use when rendering the node. */
    blueprint: MaterialNodeBlueprint;

    /** Map of input socket IDs and addresses to output sockets connected to them. */
    inputs: Map<string, MaterialNodeSocketAddr>;

    /** Map of output socket IDs and addresses to input sockets connected to them. */
    outputs: Map<string, MaterialNodeSocketAddr>;
};

// Minimal version is used for updates, since replacing the entire blueprint at once
// is not supported anyway.
export type MinimalRenderableMaterialNodeSnapshot = Omit<
    RenderableMaterialNodeSnapshot,
    "blueprint"
>;

export type RenderProgressEvent = {
    finishedJobs: number;
    totalJobs: number;
};

export interface WebGL2RenderWorker {
    /**
     * Updates the transform matrix of UI elements rendered by the
     * worker on top of the material graph editor.
     *
     * @param x
     * @param y
     * @param scale
     */
    setEditorUITransform(x: number, y: number, scale: number): void;

    /**
     * Updates the size of the canvas onto which the worker
     * renders additional UI elements.
     *
     * @param width
     * @param height
     */
    setEditorUIViewportSize(width: number, height: number): void;
}

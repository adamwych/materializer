import { MaterialGraphEdge } from "../material/graph";
import { MaterialNode, MaterialNodeBlueprint } from "../material/node";

export type MaterialSnapshot = {
    nodes: Map<number, MaterialNodeSnapshot>;
    edges: Array<MaterialGraphEdge>;
};

export type MaterialNodeSnapshot = {
    /** The node itself. */
    node: MaterialNode;

    /** Blueprint to use when rendering the node. */
    blueprint: MaterialNodeBlueprint;
};

// Minimal version is used for updates, since replacing the entire blueprint at once
// is not supported anyway.
export type MinimalMaterialNodeSnapshot = Omit<MaterialNodeSnapshot, "blueprint">;

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

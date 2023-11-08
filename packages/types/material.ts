import { ReactiveMap } from "@solid-primitives/map";
import { createMutable } from "solid-js/store";
import { v4 as uuidv4 } from "uuid";
import { EDITOR_GRAPH_HEIGHT, EDITOR_GRAPH_WIDTH } from "../ui/editor/consts";
import { MaterialGraphEdge } from "./graph";
import { MaterialNode } from "./node";

/**
 * A material is a set of interconnected nodes, that combined together
 * create shapes and patterns.
 */
export type Material = {
    /** A string uniquely identifying this material (UUIDv4). */
    id: string;

    /** A user-assignable label that describes this material. */
    name: string;

    /** List of nodes that this material contains. */
    nodes: Map<number, MaterialNode>;

    /** List of connections between nodes. */
    connections: Array<MaterialGraphEdge>;
};

export function createEmptyMaterial(): Material {
    return {
        id: uuidv4(),
        name: "New Material",
        nodes: new ReactiveMap<number, MaterialNode>([
            [
                0,
                createMutable({
                    id: 0,
                    name: "Solid color",
                    path: "materializer/solid-color",
                    x: EDITOR_GRAPH_WIDTH / 2 - 64 - 128,
                    y: EDITOR_GRAPH_HEIGHT / 2 - 64,
                    parameters: {
                        color: [0.27, 0.27, 1],
                    },
                    textureSize: 1,
                }),
            ],
            [
                1,
                createMutable({
                    id: 1,
                    name: "Output",
                    path: "materializer/output",
                    x: EDITOR_GRAPH_WIDTH / 2 - 64 + 128,
                    y: EDITOR_GRAPH_HEIGHT / 2 - 64,
                    parameters: {
                        color: [1, 0, 0],
                    },
                    textureSize: 2048,
                }),
            ],
        ]),
        connections: [
            {
                from: [0, "color"],
                to: [1, "color"],
            },
        ],
    };
}

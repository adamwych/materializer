import { ReactiveMap } from "@solid-primitives/map";
import { createMutable } from "solid-js/store";
import { v4 as uuidv4 } from "uuid";
import { PbrTargetTextureType } from "../types/pbr";
import TextureFilterMethod from "../types/texture-filter";
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
    edges: Array<MaterialGraphEdge>;
};

export function createDefaultMaterial(): Material {
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
                    y: EDITOR_GRAPH_HEIGHT / 2 - 64 - 128,
                    parameters: {
                        //color: [0.15, 0.3, 1],
                        color: [1, 1, 1],
                    },
                    textureSize: 1,
                    textureFilterMethod: TextureFilterMethod.Linear,
                }),
            ],
            [
                1,
                createMutable({
                    id: 1,
                    name: "Base Color Output",
                    path: "materializer/output",
                    x: EDITOR_GRAPH_WIDTH / 2 - 64 + 128,
                    y: EDITOR_GRAPH_HEIGHT / 2 - 64 - 128,
                    parameters: {
                        targetTexture: PbrTargetTextureType.BaseColor,
                    },
                    textureSize: 2048,
                    textureFilterMethod: TextureFilterMethod.Linear,
                }),
            ],
            [
                2,
                createMutable({
                    id: 2,
                    name: "Solid color",
                    path: "materializer/solid-color",
                    x: EDITOR_GRAPH_WIDTH / 2 - 64 - 128,
                    y: EDITOR_GRAPH_HEIGHT / 2 - 64,
                    parameters: {
                        color: [1, 1, 1],
                    },
                    textureSize: 1,
                    textureFilterMethod: TextureFilterMethod.Linear,
                }),
            ],
            [
                3,
                createMutable({
                    id: 3,
                    name: "AO Output",
                    path: "materializer/output",
                    x: EDITOR_GRAPH_WIDTH / 2 - 64 + 128,
                    y: EDITOR_GRAPH_HEIGHT / 2 - 64,
                    parameters: {
                        targetTexture: PbrTargetTextureType.AmbientOcclusion,
                    },
                    textureSize: 2048,
                    textureFilterMethod: TextureFilterMethod.Linear,
                }),
            ],
            [
                4,
                createMutable({
                    id: 4,
                    name: "Solid color",
                    path: "materializer/solid-color",
                    x: EDITOR_GRAPH_WIDTH / 2 - 64 - 128,
                    y: EDITOR_GRAPH_HEIGHT / 2 - 64 + 128,
                    parameters: {
                        color: [0.8, 0.8, 0.8],
                    },
                    textureSize: 1,
                    textureFilterMethod: TextureFilterMethod.Linear,
                }),
            ],
            [
                5,
                createMutable({
                    id: 5,
                    name: "Roughness Output",
                    path: "materializer/output",
                    x: EDITOR_GRAPH_WIDTH / 2 - 64 + 128,
                    y: EDITOR_GRAPH_HEIGHT / 2 - 64 + 128,
                    parameters: {
                        targetTexture: PbrTargetTextureType.Roughness,
                    },
                    textureSize: 2048,
                    textureFilterMethod: TextureFilterMethod.Linear,
                }),
            ],
        ]),
        edges: [
            {
                from: [0, "color"],
                to: [1, "color"],
            },
            {
                from: [2, "color"],
                to: [3, "color"],
            },
            {
                from: [4, "color"],
                to: [5, "color"],
            },
        ],
    };
}

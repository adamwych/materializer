import { createContextProvider } from "@solid-primitives/context";
import { ReactiveMap } from "@solid-primitives/map";
import { Accessor, createSignal } from "solid-js";
import { createMutable, unwrap } from "solid-js/store";
import { Material } from "../material/material";
import { MaterialNode } from "../material/node";
import { MaterialNodeSocketAddr } from "../material/node-socket";
import TextureFilterMethod from "../types/texture-filter";
import { WorkspaceClipboardState } from "./workspace";

export type SerializedMaterialNode = {
    id: number;
    name: string;
    path: string;
    x: number;
    y: number;
    parameters: Record<string, unknown>;
    textureSize: number;
    textureFilterMethod: TextureFilterMethod;
};

export type SerializedMaterial = {
    version: number;
    id: string;
    name: string;
    nodes: Array<SerializedMaterialNode>;
    connections: Array<SerializedMaterialGraphEdge>;
    defaultTextureSize: number;
    defaultTextureFiltering: TextureFilterMethod;
    savedAt: number;
};

export type SerializedMaterialGraphEdge = {
    from: MaterialNodeSocketAddr;
    to: MaterialNodeSocketAddr;
};

/**
 * This context provides utilities for storing and reading presistent user data.
 */
export const [UserDataStorageProvider, useUserDataStorage] = createContextProvider(() => {
    const [savedMaterials, setSavedMaterials] = createSignal<{ [k: string]: SerializedMaterial }>(
        JSON.parse(localStorage.getItem("workspace.savedMaterials") ?? "{}"),
    );

    function serializeMaterial(material: Material): SerializedMaterial {
        return {
            version: 1,
            id: material.id,
            name: material.name,
            nodes: Array.from(material.nodes.values()).map((node) => ({
                id: node.id,
                name: node.name,
                path: node.path,
                x: node.x,
                y: node.y,
                parameters: structuredClone(unwrap(node.parameters)),
                textureSize: node.textureSize,
                textureFilterMethod: node.textureFilterMethod,
            })),
            connections: structuredClone(unwrap(material.edges)),
            defaultTextureSize: material.defaultTextureSize,
            defaultTextureFiltering: material.defaultTextureFilter,
            savedAt: new Date().getTime(),
        };
    }

    function deserializeMaterial(material: SerializedMaterial): Material {
        if (material.version !== 1) {
            throw new Error(`Unsupported material format version: ${material.version}`);
        }

        const nodes = new ReactiveMap<number, MaterialNode>();
        material.nodes.forEach((node) => {
            nodes.set(
                node.id,
                createMutable({
                    id: node.id,
                    name: node.name,
                    path: node.path,
                    parameters: structuredClone(node.parameters),
                    textureSize: node.textureSize,
                    textureFilterMethod: node.textureFilterMethod,
                    x: node.x,
                    y: node.y,
                }),
            );
        });

        return {
            id: material.id,
            name: material.name,
            nodes,
            edges: structuredClone(material.connections),
            defaultTextureSize: material.defaultTextureSize,
            defaultTextureFilter: material.defaultTextureFiltering,
        };
    }

    return {
        serializeMaterial,
        deserializeMaterial,

        saveClipboardState(clipboardState: WorkspaceClipboardState) {
            localStorage.setItem("clipboard", JSON.stringify(clipboardState));
        },

        /**
         * Reads current clipboard state from local storage and returns it.
         * Returns `undefined` if clipboard is empty or data is malformed.
         */
        readClipboardState(): WorkspaceClipboardState | undefined {
            const clipboardState = localStorage.getItem("clipboard");
            if (clipboardState) {
                try {
                    return JSON.parse(clipboardState);
                } catch (error) {
                    return undefined;
                }
            }

            return undefined;
        },

        saveMaterial(material: Material) {
            setSavedMaterials((materials) => {
                const newMaterials = { ...materials };
                newMaterials[material.id] = serializeMaterial(material);
                localStorage.setItem("workspace.savedMaterials", JSON.stringify(newMaterials));
                return newMaterials;
            });
        },

        importMaterial(serialized: SerializedMaterial) {
            setSavedMaterials((materials) => {
                const newMaterials = { ...materials };
                newMaterials[serialized.id] = serialized;
                localStorage.setItem("workspace.savedMaterials", JSON.stringify(newMaterials));
                return newMaterials;
            });
        },

        removeMaterial(id: string) {
            setSavedMaterials((materials) => {
                const newMaterials = { ...materials };
                delete newMaterials[id];
                localStorage.setItem("workspace.savedMaterials", JSON.stringify(newMaterials));
                return newMaterials;
            });
        },

        getMaterialById(uuid: string): Material | undefined {
            return this.materials().get(uuid);
        },

        get materials(): Accessor<Map<string, Material>> {
            return () => {
                const map = new Map<string, Material>();
                for (const [id, material] of Object.entries(savedMaterials())) {
                    map.set(id, deserializeMaterial(material));
                }
                return map;
            };
        },

        get savedMaterials(): Accessor<Map<string, SerializedMaterial>> {
            return () => new Map(Object.entries(savedMaterials()));
        },
    };
});

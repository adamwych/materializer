import { createContextProvider } from "@solid-primitives/context";
import { Accessor, createSignal } from "solid-js";
import { createMutable, unwrap } from "solid-js/store";
import { Material } from "../types/material";
import { MaterialNode } from "../types/node";
import { MaterialNodeSocketAddr } from "../types/node-socket";
import { ReactiveMap } from "@solid-primitives/map";

export type SerializedMaterialNode = {
    id: number;
    name: string;
    path: string;
    x: number;
    y: number;
    parameters: Record<string, unknown>;
    textureSize: number;
};

export type SerializedMaterial = {
    version: number;
    id: string;
    name: string;
    nodes: Array<SerializedMaterialNode>;
    connections: Array<SerializedMaterialGraphEdge>;
    savedAt: number;
};

export type SerializedMaterialGraphEdge = {
    from: MaterialNodeSocketAddr;
    to: MaterialNodeSocketAddr;
};

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
            })),
            connections: structuredClone(unwrap(material.connections)),
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
                    x: node.x,
                    y: node.y,
                }),
            );
        });

        return {
            id: material.id,
            name: material.name,
            nodes,
            connections: structuredClone(material.connections),
        };
    }

    return {
        serializeMaterial,
        deserializeMaterial,

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

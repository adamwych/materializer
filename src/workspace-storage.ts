import { createContextProvider } from "@solid-primitives/context";
import { Accessor, createSignal } from "solid-js";
import { Material } from "./types/material.ts";
import TextureFilterMethod from "./types/texture-filter.ts";

export type SerializedMaterialNode = {
    id: number;
    path: string;
    label: string;
    parameters: { [k: string]: unknown };
    x: number;
    y: number;
};

export type SerializedMaterial = {
    version: number;
    id: string;
    name: string;
    textureWidth: number;
    textureHeight: number;
    textureFiltering: TextureFilterMethod;
    nodes: Array<SerializedMaterialNode>;
    connections: Array<{
        from: SerializedMaterialNodeSocketAddr;
        to: SerializedMaterialNodeSocketAddr;
    }>;
    savedAt: number;
};

export type SerializedMaterialNodeSocketAddr = {
    nodeId: number;
    socketId: string;
};

export const [WorkspaceStorageProvider, useWorkspaceStorage] = createContextProvider(() => {
    const [savedMaterials, setSavedMaterials] = createSignal<{ [k: string]: SerializedMaterial }>(
        JSON.parse(localStorage.getItem("workspace.savedMaterials") ?? "{}"),
    );

    function serializeMaterial(material: Material): SerializedMaterial {
        return {
            version: 1,
            id: material.id,
            name: material.name,
            textureWidth: material.textureWidth,
            textureHeight: material.textureHeight,
            textureFiltering: material.textureFiltering,
            nodes: material.nodes.map((node) => ({
                id: node.id,
                path: node.path,
                label: node.label,
                parameters: structuredClone(node.parameters),
                x: node.x,
                y: node.y,
            })),
            connections: structuredClone(material.connections),
            savedAt: new Date().getTime(),
        };
    }

    function deserializeMaterial(material: SerializedMaterial): Material {
        if (material.version !== 1) {
            throw new Error(`Unsupported material format version: ${material.version}`);
        }

        return {
            id: material.id,
            name: material.name,
            textureWidth: material.textureWidth,
            textureHeight: material.textureHeight,
            textureFiltering: material.textureFiltering,
            nodes: material.nodes.map((node) => ({
                id: node.id,
                label: node.label,
                parameters: structuredClone(node.parameters),
                path: node.path,
                x: node.x,
                y: node.y,
                zIndex: node.id,
            })),
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

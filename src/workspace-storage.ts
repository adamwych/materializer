import { createContextProvider } from "@solid-primitives/context";
import { Material } from "./types/material.ts";
import TextureFilterMethod from "./types/texture-filter.ts";

type SerializedMaterialNode = {
    id: number;
    path: string;
    label: string;
    parameters: { [k: string]: unknown };
    x: number;
    y: number;
};

type SerializedMaterial = {
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

type SerializedMaterialNodeSocketAddr = {
    nodeId: number;
    socketId: string;
};

export const [WorkspaceStorageProvider, useWorkspaceStorage] = createContextProvider(() => {
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
                parameters: node.parameters,
                x: node.x,
                y: node.y,
            })),
            connections: material.connections,
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
                parameters: node.parameters,
                path: node.path,
                x: node.x,
                y: node.y,
                zIndex: node.id,
            })),
            connections: material.connections,
        };
    }

    return {
        saveMaterial(material: Material) {
            const materials = JSON.parse(localStorage.getItem("workspace.savedMaterials") ?? "{}");
            materials[material.id] = serializeMaterial(material);
            localStorage.setItem("workspace.savedMaterials", JSON.stringify(materials));
        },

        getMaterialById(uuid: string): Material | undefined {
            return this.getMaterials().get(uuid);
        },

        getMaterials(): Map<string, Material> {
            const map = new Map<string, Material>();
            const serializedMap: { [k: string]: SerializedMaterial } = JSON.parse(
                localStorage.getItem("workspace.savedMaterials") ?? "{}",
            );

            for (const [id, material] of Object.entries(serializedMap)) {
                map.set(id, deserializeMaterial(material));
            }

            return map;
        },

        getSavedMaterials(): Map<string, SerializedMaterial> {
            return new Map(
                Object.entries(
                    JSON.parse(localStorage.getItem("workspace.savedMaterials") ?? "{}"),
                ),
            );
        },
    };
});

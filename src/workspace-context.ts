import { createContextProvider } from "@solid-primitives/context";
import { createSignal } from "solid-js";
import { unwrap } from "solid-js/store";
import { v4 as uuidv4 } from "uuid";
import { Material } from "./types/material.ts";
import { useWorkspaceStorage } from "./workspace-storage.ts";
import TextureFilterMethod from "./types/texture-filter.ts";

type Props = {
    initialMaterial: Material;
};

export const [WorkspaceContextProvider, useWorkspaceContext] = createContextProvider(
    (props: Props) => {
        const storage = useWorkspaceStorage()!;
        const [openedMaterials, setOpenedMaterials] = createSignal<Array<Material>>([
            props.initialMaterial,
        ]);
        const [activeEditorTab, setActiveEditorTab] = createSignal<string | undefined>(
            props.initialMaterial.id,
        );

        return {
            openMaterial(material: Material) {
                setOpenedMaterials((materials) => {
                    const alreadyOpen = materials.some((x) => x.id === material.id);
                    if (alreadyOpen) {
                        return materials;
                    }

                    const newMaterials = [...materials];
                    newMaterials.push(material);
                    return newMaterials;
                });
                setActiveEditorTab(material.id);
            },

            openNewMaterial() {
                this.openMaterial({
                    id: uuidv4(),
                    name: "New Material",
                    nodes: [],
                    textureWidth: 1024,
                    textureHeight: 1024,
                    textureFiltering: TextureFilterMethod.Linear,
                    connections: [],
                });
            },

            saveActiveMaterial() {
                const activeMaterial = this.activeEditorTabMaterial();
                if (activeMaterial) {
                    storage.saveMaterial(unwrap(activeMaterial));
                }
            },

            closeEditorTab(materialId: string) {
                if (activeEditorTab() === materialId) {
                    const materials = openedMaterials();
                    const materialIndex = materials.findIndex((x) => x.id === materialId);
                    if (materials.length === 1) {
                        setActiveEditorTab(undefined);
                    } else {
                        const closestMaterialIndex = materialIndex === 0 ? 1 : materialIndex - 1;
                        setActiveEditorTab(materials[closestMaterialIndex].id);
                    }
                }

                setOpenedMaterials((materials) => {
                    const newMaterials = [...materials];
                    newMaterials.splice(
                        newMaterials.findIndex((x) => x.id === materialId),
                        1,
                    );
                    return newMaterials;
                });
            },

            openedMaterials,
            activeEditorTab,
            setActiveEditorTab,

            get activeEditorTabMaterial() {
                return () => openedMaterials().find((x) => x.id === activeEditorTab());
            },
        };
    },
);

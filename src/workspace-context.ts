import { createContextProvider } from "@solid-primitives/context";
import { createSignal } from "solid-js";
import { createStore, produce, unwrap } from "solid-js/store";
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
        const [materials, setMaterials] = createStore<Array<Material>>([props.initialMaterial]);
        const [activeMaterialId, setActiveMaterialId] = createSignal<string | undefined>(
            props.initialMaterial.id,
        );

        return {
            /**
             * Opens an editor tab for given material.
             * @param material
             */
            openMaterial(material: Material) {
                setMaterials((materials) => {
                    const alreadyOpen = materials.some((x) => x.id === material.id);
                    if (alreadyOpen) {
                        return materials;
                    }

                    const newMaterials = [...materials];
                    newMaterials.push(material);
                    return newMaterials;
                });
                setActiveMaterialId(material.id);
            },

            /**
             * Creates a new, empty material and opens its editor.
             */
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

            mutateMaterial(id: string, mutator: (material: Material) => void) {
                setMaterials(
                    produce((materials) => {
                        const material = materials.find((x) => x.id === id);
                        if (material) {
                            mutator(material);
                        }
                    }),
                );
            },

            saveActiveMaterial() {
                const activeMaterial = this.activeEditorTabMaterial();
                if (activeMaterial) {
                    storage.saveMaterial(unwrap(activeMaterial));
                }
            },

            closeEditorTab(materialId: string) {
                if (activeMaterialId() === materialId) {
                    const materialIndex = materials.findIndex((x) => x.id === materialId);
                    if (materials.length === 1) {
                        setActiveMaterialId(undefined);
                    } else {
                        const closestMaterialIndex = materialIndex === 0 ? 1 : materialIndex - 1;
                        setActiveMaterialId(materials[closestMaterialIndex].id);
                    }
                }

                setMaterials((materials) => {
                    const newMaterials = [...materials];
                    newMaterials.splice(
                        newMaterials.findIndex((x) => x.id === materialId),
                        1,
                    );
                    return newMaterials;
                });
            },

            materials,
            activeMaterialId,
            setActiveMaterialId,

            get activeEditorTabMaterial() {
                return () => materials.find((x) => x.id === activeMaterialId());
            },
        };
    },
);

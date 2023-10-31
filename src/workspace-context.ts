import { createContextProvider } from "@solid-primitives/context";
import { createSignal } from "solid-js";
import { unwrap } from "solid-js/store";
import { v4 as uuidv4 } from "uuid";
import { Material } from "./types/material.ts";
import { useWorkspaceStorage } from "./workspace-storage.ts";

type Props = {
    initialMaterial: Material;
};

export const [WorkspaceContextProvider, useWorkspaceContext] = createContextProvider(
    (props: Props) => {
        const storage = useWorkspaceStorage()!;
        const [openedMaterials, setOpenedMaterials] = createSignal<Array<Material>>([
            props.initialMaterial,
        ]);
        const [activeEditorTab, setActiveEditorTab] = createSignal<number>(0);

        return {
            openMaterial(material: Material) {
                setOpenedMaterials((materials) => {
                    const index = materials.findIndex((x) => x.id === material.id);
                    if (index !== -1) {
                        setActiveEditorTab(index);
                        return materials;
                    }

                    const newMaterials = [...materials];
                    newMaterials.push(material);
                    setActiveEditorTab(newMaterials.length - 1);
                    return newMaterials;
                });
            },

            openNewMaterial() {
                this.openMaterial({
                    id: uuidv4(),
                    name: "New Material",
                    nodes: [],
                    textureWidth: 1024,
                    textureHeight: 1024,
                    connections: [],
                });
            },

            saveActiveMaterial() {
                storage.saveMaterial(unwrap(this.activeEditorTabMaterial()));
            },

            openedMaterials,
            activeEditorTab,
            setActiveEditorTab,

            get activeEditorTabMaterial() {
                return () => openedMaterials()[activeEditorTab()];
            },
        };
    },
);

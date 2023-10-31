import { createContextProvider } from "@solid-primitives/context";
import { createSignal } from "solid-js";
import { Material } from "./types/material.ts";

type Props = {
    initialMaterial: Material;
};

export const [WorkspaceContextProvider, useWorkspaceContext] = createContextProvider(
    (props: Props) => {
        const [openedMaterials, setOpenedMaterials] = createSignal<Array<Material>>([
            props.initialMaterial,
        ]);
        const [activeEditorTab, setActiveEditorTab] = createSignal<number>(0);

        return {
            openMaterial(material: Material) {
                setOpenedMaterials((materials) => {
                    const newMaterials = [...materials];
                    newMaterials.push(material);
                    setActiveEditorTab(newMaterials.length - 1);
                    return newMaterials;
                });
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

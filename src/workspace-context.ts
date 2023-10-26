import { createContextProvider } from "@solid-primitives/context";
import { createSignal } from "solid-js";
import { Material } from "./types/material.ts";

type Props = {
    initialMaterial: Material;
};

export const [WorkspaceContextProvider, useWorkspaceContext] = createContextProvider((props: Props) => {
    const [openedMaterials, _setOpenedMaterials] = createSignal<Array<Material>>([props.initialMaterial]);
    const [activeEditorTab, _setActiveEditorTab] = createSignal<number>(0);

    return {
        openedMaterials,
        activeEditorTab,

        get activeEditorTabMaterial() {
            return () => openedMaterials()[activeEditorTab()];
        },
    };
});

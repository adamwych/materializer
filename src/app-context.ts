import { createContextProvider } from "@solid-primitives/context";
import { createSignal } from "solid-js";
import { Material } from "./types/material.ts";
import { IEditorRuntimeContext } from "./graph-editor/runtime-context.tsx";
import { ReactiveMap } from "@solid-primitives/map";

type Props = {
    initialMaterial: Material;
};

const [AppContextProvider, useAppContext] = createContextProvider(
    (props: Props) => {
        const [editorTabs, setEditorTabs] = createSignal<Array<Material>>([
            props.initialMaterial,
        ]);
        const [activeEditorTab, setActiveEditorTab] = createSignal<number>(0);
        const runtimeContexts = new ReactiveMap<
            Material,
            IEditorRuntimeContext
        >();

        return {
            registerRuntimeContext(
                material: Material,
                context: IEditorRuntimeContext,
            ) {
                runtimeContexts.set(material, context);
            },

            getRuntimeContext(material: Material) {
                return runtimeContexts.get(material);
            },

            editorTabs,
            activeEditorTab,

            get activeEditorTabMaterial() {
                return () => editorTabs()[activeEditorTab()];
            },
        };
    },
);

export { AppContextProvider, useAppContext };

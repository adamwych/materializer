import { Material } from "../types/material.ts";
import { DeepReadonly } from "ts-essentials";
import { EditorRuntimeContextProvider } from "./runtime-context.tsx";
import UIMaterialNodeInspectorPanel from "./inspector/inspector.tsx";
import UIMaterialNodesGraph from "./graph.tsx";
import { EditorConnectionBuilderProvider } from "./connection-builder.tsx";
import { EditorSelectionManagerProvider } from "./selection/manager.ts";
import { EditorMaterialContextProvider } from "./material-context.ts";
import { EditorDiagnosticsContextProvider } from "./diagnostics-context.ts";
import UIMaterialPreviewWindow from "../preview/window.tsx";
import { MultiProvider } from "@solid-primitives/context";

interface Props {
    material: Material;
}

export default function UIMaterialGraphEditor(props: DeepReadonly<Props>) {
    return (
        <MultiProvider
            values={[
                EditorDiagnosticsContextProvider,
                [EditorMaterialContextProvider, { material: props.material }],
                EditorRuntimeContextProvider,
                EditorSelectionManagerProvider,
                EditorConnectionBuilderProvider,
            ]}
        >
            <div class="w-full h-full flex">
                <UIMaterialNodesGraph />
                <div class="flex flex-col">
                    <UIMaterialNodeInspectorPanel />
                    <UIMaterialPreviewWindow />
                </div>
            </div>
        </MultiProvider>
    );
}

import { MultiProvider } from "@solid-primitives/context";
import { DeepReadonly } from "ts-essentials";
import { RenderingEngineProvider } from "../renderer/engine.ts";
import { RenderingSchedulerProvider } from "../renderer/scheduler.ts";
import { Material } from "../types/material.ts";
import { EditorConnectionBuilderProvider } from "./connection-builder.tsx";
import { EditorContextProvider } from "./editor-context.ts";
import MaterialGraphEditorNodes from "./graph.tsx";
import MaterialNodeInspectorPanel from "./inspector/inspector.tsx";
import { MaterialContextProvider } from "./material-context.ts";
import MaterialPreviewPanel from "./preview-panel.tsx";
import { EditorSelectionManagerProvider } from "./selection/manager.ts";

interface Props {
    material: Material;
}

export default function MaterialGraphEditor(props: DeepReadonly<Props>) {
    return (
        <MultiProvider
            values={[
                [MaterialContextProvider, props.material],
                RenderingEngineProvider,
                RenderingSchedulerProvider,
                EditorContextProvider,
                EditorSelectionManagerProvider,
                EditorConnectionBuilderProvider,
            ]}
        >
            <div
                class="flex w-full"
                style={{
                    height: "calc(100vh - 35px - 35px)",
                }}
            >
                <MaterialGraphEditorNodes />

                <div class="flex flex-col" style={{ "flex-basis": "400px" }}>
                    <MaterialNodeInspectorPanel />
                    <MaterialPreviewPanel />
                </div>
            </div>
        </MultiProvider>
    );
}

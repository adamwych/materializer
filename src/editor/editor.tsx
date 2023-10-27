import { Material } from "../types/material.ts";
import { DeepReadonly } from "ts-essentials";
import { EditorContextProvider } from "./editor-context.ts";
import MaterialNodeInspectorPanel from "./inspector/inspector.tsx";
import MaterialGraphEditorNodes from "./graph.tsx";
import { EditorConnectionBuilderProvider } from "./connection-builder.tsx";
import { EditorSelectionManagerProvider } from "./selection/manager.ts";
import MaterialPreviewPanel from "./preview/panel.tsx";
import { MultiProvider } from "@solid-primitives/context";
import { MaterialContextProvider } from "./material-context.ts";
import { RenderingEngineProvider } from "../renderer/engine.ts";
import { RenderingSchedulerProvider } from "../renderer/scheduler.ts";

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

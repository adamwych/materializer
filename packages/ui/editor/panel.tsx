import { MultiProvider } from "@solid-primitives/context";
import { Show } from "solid-js";
import { RenderEngineProvider } from "../../renderer/engine";
import { MaterialProvider } from "../../stores/material";
import { ShortcutsProvider } from "../../stores/shortcuts";
import { useWorkspaceStore } from "../../stores/workspace";
import EditorAddNodePopup from "./add-node-popup/popup";
import { EditorAddNodePopupRef } from "./add-node-popup/ref";
import { EditorRuntimeCache } from "./canvas/cache";
import EditorCanvas from "./canvas/canvas";
import { EditorCameraState } from "./canvas/interaction/camera";
import { EditorConnectionBuilder } from "./canvas/interaction/connection-builder";
import { EditorGesturesHandler } from "./canvas/interaction/gestures";
import { EditorInteractionManager } from "./canvas/interaction/manager";
import { EditorSelectionManager } from "./canvas/interaction/selection";
import EditorEnvironmentPreviewPanel from "./env-preview-panel";
import InspectorPanel from "./inspector/panel";
import WorkspacePanel from "./workspace-panel";
import { Material } from "../../types/material";
import { JSX } from "solid-js";
import EditorSidebar from "./sidebar";

function Wrapper(props: { children: (material: Material) => JSX.Element }) {
    const workspaceStore = useWorkspaceStore()!;
    return <>{props.children(workspaceStore.getActiveMaterial()!)}</>;
}

export default function EditorPanel() {
    return (
        <Wrapper>
            {(material) => (
                <Show when={material}>
                    <MultiProvider
                        values={[
                            MaterialProvider,
                            RenderEngineProvider,
                            EditorRuntimeCache,
                            EditorAddNodePopupRef,
                            EditorCameraState,
                            EditorSelectionManager,
                            EditorGesturesHandler,
                            EditorInteractionManager,
                            EditorConnectionBuilder,
                            ShortcutsProvider,
                        ]}
                    >
                        <EditorAddNodePopup />

                        <div
                            class="flex w-full"
                            style={{
                                height: "calc(100vh - 36px)",
                            }}
                        >
                            <EditorSidebar side="left">
                                <WorkspacePanel />
                                <EditorEnvironmentPreviewPanel />
                            </EditorSidebar>

                            <EditorCanvas class="flex-1" />

                            <EditorSidebar side="right">
                                <InspectorPanel />
                            </EditorSidebar>
                        </div>
                    </MultiProvider>
                </Show>
            )}
        </Wrapper>
    );
}

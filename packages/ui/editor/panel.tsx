import { MultiProvider } from "@solid-primitives/context";
import { JSX, Show } from "solid-js";
import { Material } from "../../material/material";
import { RenderEngineProvider } from "../../renderer/engine";
import { MaterialProvider } from "../../stores/material";
import { ShortcutsProvider } from "../../stores/shortcuts";
import { useWorkspaceStore } from "../../stores/workspace";
import EditorAddNodePopup from "./add-node-popup/popup";
import { EditorAddNodePopupRef } from "./add-node-popup/ref";
import { EditorRuntimeCache } from "./canvas/cache";
import EditorCanvas from "./canvas/canvas";
import { EditorCameraState } from "./canvas/interaction/camera";
import { EditorCommandsRegistry } from "./canvas/interaction/commands";
import { EditorConnectionBuilder } from "./canvas/interaction/connection-builder";
import { EditorGesturesHandler } from "./canvas/interaction/gestures";
import { EditorHistoryProvider } from "./canvas/interaction/history";
import { EditorInteractionManager } from "./canvas/interaction/manager";
import { EditorSelectionManager } from "./canvas/interaction/selection";
import PreviewPanel from "./preview-panel";
import HistoryPanel from "./history-panel";
import InspectorPanel from "./inspector/panel";
import EditorSidebar from "./sidebar";
import WorkspacePanel from "./workspace-panel";

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
                            EditorCommandsRegistry,
                            EditorHistoryProvider,
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
                                <HistoryPanel />
                            </EditorSidebar>

                            <EditorCanvas class="flex-1" />

                            <EditorSidebar side="right">
                                <InspectorPanel />
                                <PreviewPanel />
                            </EditorSidebar>
                        </div>
                    </MultiProvider>
                </Show>
            )}
        </Wrapper>
    );
}

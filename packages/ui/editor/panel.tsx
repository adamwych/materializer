import { MultiProvider } from "@solid-primitives/context";
import { Show } from "solid-js";
import { RenderEngineProvider } from "../../renderer/engine";
import { MaterialProvider } from "../../stores/material";
import { ShortcutsProvider } from "../../stores/shortcuts";
import EditorAddNodePopup from "./add-node-popup/popup";
import { EditorAddNodePopupRef } from "./add-node-popup/ref";
import { EditorRuntimeCache } from "./canvas/cache";
import EditorCanvas from "./canvas/canvas";
import { EditorCameraState } from "./canvas/interaction/camera";
import { EditorConnectionBuilder } from "./canvas/interaction/connection-builder";
import { EditorGesturesHandler } from "./canvas/interaction/gestures";
import { EditorInteractionManager } from "./canvas/interaction/manager";
import { EditorSelectionManager } from "./canvas/interaction/selection";
import InspectorPanel from "./inspector/panel";
import EditorEnvironmentPreviewPanel from "./env-preview-panel";
import EditorTabsBar from "./tabs-bar";

export default function EditorPanel() {
    return (
        <EditorTabsBar>
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
                                height: "calc(100vh - 36px - 36px)",
                            }}
                        >
                            <EditorCanvas class="flex-1" material={material!} />

                            <div class="flex flex-col justify-between bg-gray-100">
                                <InspectorPanel material={material!} />
                                <EditorEnvironmentPreviewPanel />
                            </div>
                        </div>
                    </MultiProvider>
                </Show>
            )}
        </EditorTabsBar>
    );
}

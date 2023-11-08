import { RiSystemAddFill, RiSystemCloseFill } from "solid-icons/ri";
import { For, Show, onMount } from "solid-js";
import { Portal } from "solid-js/web";
import { useMaterialStore } from "../../../stores/material";
import { useNodeBlueprintsStore } from "../../../stores/blueprints";
import assertInWindowBounds from "../../../utils/assertInWindowBounds";
import { useEditorCameraState } from "../canvas/interaction/camera";
import EditorAddNodePopupPackage from "./package";
import { useEditorAddNodePopupRef } from "./ref";

export default function EditorAddNodePopup() {
    const ref = useEditorAddNodePopupRef()!;
    const nodePkgsRegistry = useNodeBlueprintsStore()!;
    const materialActions = useMaterialStore()!;
    const cameraState = useEditorCameraState()!;

    function onItemClick(packageId: string, nodeId: string) {
        const coords = cameraState.mapCoordsToGraphSpace(ref.coords()!.x, ref.coords()!.y);
        const node = materialActions.instantiateNode(packageId + "/" + nodeId, coords.x, coords.y);
        ref.hide(node);
    }

    return (
        <Show when={ref.coords()}>
            <Portal>
                <div class="fixed top-0 left-0 w-full h-full z-dialog" onClick={() => ref.hide()}>
                    <div
                        ref={(e) => onMount(() => assertInWindowBounds(e))}
                        class="animate-fade-scale-in origin-top-left fixed w-[224px] rounded-md bg-gray-100 border border-gray-300 shadow-md"
                        style={{
                            top: ref.coords()!.y + "px",
                            left: ref.coords()!.x + "px",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div class="p-2 text-sm text-gray-600 flex justify-between items-center border-b border-gray-200">
                            <div class="flex items-center gap-1">
                                <RiSystemAddFill size={16} />
                                <span class="font-semibold">Add node</span>
                            </div>
                            <RiSystemCloseFill size={16} onClick={() => ref.hide()} />
                        </div>

                        <div
                            class="overflow-y-auto max-h-[66vh]"
                            onWheel={(ev) => ev.stopPropagation()}
                        >
                            <For each={nodePkgsRegistry.getAll()}>
                                {([id, pkg]) => (
                                    <EditorAddNodePopupPackage
                                        id={id}
                                        package={pkg}
                                        onItemClick={onItemClick}
                                    />
                                )}
                            </For>
                        </div>
                    </div>
                </div>
            </Portal>
        </Show>
    );
}

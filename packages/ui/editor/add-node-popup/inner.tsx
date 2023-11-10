import { RiSystemAddFill, RiSystemCloseFill } from "solid-icons/ri";
import { For, createSignal, onMount } from "solid-js";
import { useNodeBlueprintsStore } from "../../../stores/blueprints";
import { useMaterialStore } from "../../../stores/material";
import TextInput from "../../components/input/text-input";
import { useEditorCameraState } from "../canvas/interaction/camera";
import EditorAddNodePopupPackage from "./package";
import { useEditorAddNodePopupRef } from "./ref";

export default function EditorAddNodePopupInner() {
    const ref = useEditorAddNodePopupRef()!;
    const materialStore = useMaterialStore()!;
    const cameraState = useEditorCameraState()!;
    const nodePkgsRegistry = useNodeBlueprintsStore()!;
    const [searchQuery, setSearchQuery] = createSignal("");

    function onItemClick(packageId: string, nodeId: string) {
        const coords = cameraState.mapCoordsToGraphSpace(ref.coords()!.x, ref.coords()!.y);
        const node = materialStore.instantiateNode(packageId + "/" + nodeId, coords.x, coords.y);
        ref.hide(node);
    }

    return (
        <>
            <div class="p-2 text-sm text-gray-600 flex justify-between items-center border-b border-gray-200">
                <div class="flex items-center gap-1">
                    <RiSystemAddFill size={16} />
                    <span class="font-semibold">Add node</span>
                </div>
                <RiSystemCloseFill size={16} onClick={() => ref.hide()} />
            </div>

            <TextInput
                ref={(e) => onMount(() => e.focus())}
                class="rounded-none border-l-none border-x-0 border-t-0"
                placeholder="Search..."
                value={searchQuery()}
                onInput={setSearchQuery}
            />

            <div class="overflow-y-auto max-h-[66vh]" onWheel={(ev) => ev.stopPropagation()}>
                <For each={nodePkgsRegistry.getAll()}>
                    {([id, pkg]) => (
                        <EditorAddNodePopupPackage
                            id={id}
                            package={pkg}
                            searchQuery={searchQuery().toLowerCase()}
                            onItemClick={onItemClick}
                        />
                    )}
                </For>
            </div>
        </>
    );
}

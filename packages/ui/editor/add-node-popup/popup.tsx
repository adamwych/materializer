import { Show, onMount } from "solid-js";
import { Portal } from "solid-js/web";
import assertInWindowBounds from "../../../utils/assertInWindowBounds";
import EditorAddNodePopupInner from "./inner";
import { useEditorAddNodePopupRef } from "./ref";

export default function EditorAddNodePopup() {
    const ref = useEditorAddNodePopupRef()!;

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
                        <EditorAddNodePopupInner />
                    </div>
                </div>
            </Portal>
        </Show>
    );
}

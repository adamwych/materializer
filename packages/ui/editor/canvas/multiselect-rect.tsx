import { Show } from "solid-js";
import { useEditorSelectionManager } from "./interaction/selection";

export default function EditorCanvasMultiselectRect() {
    const selectionManager = useEditorSelectionManager()!;
    const rect = selectionManager.multiselectRect;

    return (
        <Show when={rect()}>
            <div
                class="bg-white bg-opacity-5 border border-gray-400"
                style={{
                    position: "absolute",
                    top: rect()!.y - 36 + "px",
                    left: rect()!.x - 340 + "px",
                    width: rect()!.width + "px",
                    height: rect()!.height + "px",
                    "z-index": Number.MAX_SAFE_INTEGER,
                }}
            />
        </Show>
    );
}

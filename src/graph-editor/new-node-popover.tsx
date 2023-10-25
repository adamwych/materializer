import { BuiltinNodeSpec, getBuiltinNodes } from "../nodes";
import { For } from "solid-js";
import { useEditorRuntimeContext } from "./runtime-context.tsx";

type Props = {
    x: number;
    y: number;
    onClose(): void;
};

export default function UIMaterialGraphNewNodePopover(props: Props) {
    const editorCtx = useEditorRuntimeContext();

    function onItemClick(spec: BuiltinNodeSpec) {
        editorCtx.instantiateNode(spec, props.x, props.y);
        props.onClose();
    }

    return (
        <div
            class="fixed w-[256px] rounded-md overflow-hidden"
            style={{
                top: props.y + "px",
                left: props.x + "px",
                "z-index": Number.MAX_SAFE_INTEGER,
            }}
            onMouseDown={(ev) => ev.stopPropagation()}
        >
            <h1 class="p-4 font-semibold uppercase text-sm bg-gray-500-0">
                Add new node
            </h1>
            <ul class="bg-gray-400-0 py-2">
                <For each={getBuiltinNodes()}>
                    {(spec) => (
                        <li
                            class="px-4 py-2 hover:bg-gray-500-0 active:bg-gray-600-0"
                            onClick={() => onItemClick(spec)}
                        >
                            {spec.name}
                        </li>
                    )}
                </For>
            </ul>
        </div>
    );
}

import { For } from "solid-js";
import { useAppContext } from "../app-context.ts";
import { useMaterialContext } from "./material-context.ts";

type Props = {
    x: number;
    y: number;
    onClose(): void;
};

export default function UIMaterialGraphNewNodePopover(props: Props) {
    const appCtx = useAppContext()!;
    const materialCtx = useMaterialContext()!;

    function onItemClick(typePath: string) {
        materialCtx.instantiateNode(typePath, props.x, props.y);
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
            <h1 class="p-4 font-semibold uppercase text-sm bg-gray-500-0">Add new node</h1>
            <For each={Array.from(appCtx.getNodesPackages().entries())}>
                {([id, pkg]) => (
                    <div class="bg-gray-400-0 py-2">
                        <div class="font-semibold px-2">{id}</div>
                        <ul>
                            <For each={Array.from(pkg.nodes.entries())}>
                                {([typeId, spec]) => (
                                    <li
                                        class="px-4 py-2 hover:bg-gray-500-0 active:bg-gray-600-0"
                                        onClick={() => onItemClick(`${id}/${typeId}`)}
                                    >
                                        {spec.name}
                                    </li>
                                )}
                            </For>
                        </ul>
                    </div>
                )}
            </For>
        </div>
    );
}

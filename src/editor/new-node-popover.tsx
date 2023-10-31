import { For } from "solid-js";
import { useAppContext } from "../app-context.ts";
import { useMaterialContext } from "./material-context.ts";
import { RiSystemAddFill, RiSystemCloseFill } from "solid-icons/ri";
import MaterialGraphNewNodePopoverPackage from "./new-node-popover-package.tsx";
import { useEditorContext } from "./editor-context.ts";

type Props = {
    x: number;
    y: number;
    onClose(): void;
};

export default function MaterialGraphNewNodePopover(props: Props) {
    const appCtx = useAppContext()!;
    const materialCtx = useMaterialContext()!;
    const editorCtx = useEditorContext()!;

    function onItemClick(typePath: string) {
        // Map coordinates from screen-space to graph-space.
        const graphX = (props.x - editorCtx.smoothedOffset().x) / editorCtx.smoothedZoom();
        const graphY = (props.y - editorCtx.smoothedOffset().y - 70) / editorCtx.smoothedZoom();

        materialCtx.instantiateNode(typePath, graphX, graphY);
        props.onClose();
    }

    return (
        <div
            class="animate-fade-in origin-top-left fixed w-[224px] rounded-md overflow-hidden bg-gray-300"
            style={{
                top: props.y + "px",
                left: props.x + "px",
                "z-index": Number.MAX_SAFE_INTEGER,
            }}
            onMouseDown={(ev) => ev.stopPropagation()}
        >
            <div class="p-2 text-sm text-gray-800 flex justify-between items-center border-b border-gray-200">
                <div class="flex items-center gap-1">
                    <RiSystemAddFill size={16} />
                    <span class="font-semibold">Add node</span>
                </div>
                <RiSystemCloseFill size={16} onClick={props.onClose} />
            </div>

            <For each={Array.from(appCtx.nodesPackages.entries())}>
                {([id, pkg]) => (
                    <MaterialGraphNewNodePopoverPackage
                        id={id}
                        package={pkg}
                        onItemClick={onItemClick}
                    />
                )}
            </For>
        </div>
    );
}

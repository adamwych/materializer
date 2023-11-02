import { For } from "solid-js";
import { useAppContext } from "../app-context.ts";
import { useMaterialContext } from "./material-context.ts";
import { RiSystemAddFill, RiSystemCloseFill } from "solid-icons/ri";
import MaterialGraphNewNodePopoverPackage from "./new-node-popover-package.tsx";
import { useEditorPanZoomContext } from "./editor-pan-zoom-context.ts";

type Props = {
    x: number;
    y: number;
    onClose(): void;
};

export default function MaterialGraphNewNodePopover(props: Props) {
    const appCtx = useAppContext()!;
    const materialCtx = useMaterialContext()!;
    const editorPanZoom = useEditorPanZoomContext()!;

    function onItemClick(typePath: string) {
        const coords = editorPanZoom.mapCoordsToGraphSpace(props.x, props.y);
        materialCtx.instantiateNode(typePath, coords.x, coords.y);
        props.onClose();
    }

    return (
        <div
            class="animate-fade-scale-in origin-top-left fixed w-[224px] rounded-md overflow-hidden bg-gray-100 border border-gray-300 shadow-md"
            style={{
                top: props.y + "px",
                left: props.x + "px",
                "z-index": Number.MAX_SAFE_INTEGER,
            }}
            onMouseDown={(ev) => ev.stopPropagation()}
        >
            <div class="p-2 text-sm text-gray-600 flex justify-between items-center border-b border-gray-200">
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

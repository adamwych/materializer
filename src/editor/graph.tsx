import { createSignal, For, Show } from "solid-js";
import { useAppContext } from "../app-context.ts";
import { Point2D } from "../types/point.ts";
import makeMouseMoveListener from "../utils/makeMouseMoveListener.ts";
import MaterialGraphEditorConnectionsOverlay from "./connections-overlay.tsx";
import { useEditorContext } from "./editor-context.ts";
import MaterialGraphEditorControls from "./graph-controls.tsx";
import { useMaterialContext } from "./material-context.ts";
import MaterialGraphNewNodePopover from "./new-node-popover.tsx";
import MaterialNodeBox from "./node.tsx";
import { useEditorSelectionManager } from "./selection/manager.ts";

export default function MaterialGraphEditorNodes() {
    const appCtx = useAppContext()!;
    const selectionManager = useEditorSelectionManager()!;
    const materialCtx = useMaterialContext()!;
    const editorCtx = useEditorContext()!;
    const [dragOffset, setDragOffset] = createSignal<Point2D>({ x: 0, y: 0 });
    const [newNodePopoverCoords, setNewNodePopoverCoords] = createSignal<Point2D>();

    const onMouseDown = makeMouseMoveListener((ev) => {
        setDragOffset((offset) => ({
            x: offset.x + ev.movementX,
            y: offset.y + ev.movementY,
        }));
    });

    window.addEventListener("keyup", (ev) => {
        const hoveredElements = document.querySelectorAll(":hover");
        if (
            hoveredElements.length === 0 ||
            hoveredElements[hoveredElements.length - 1].id !== "editor-root"
        ) {
            return;
        }

        const focusedElements = document.querySelectorAll(":focus");
        if (focusedElements.length > 0) {
            return;
        }

        if (ev.key === " ") {
            setNewNodePopoverCoords((coords) =>
                coords ? undefined : { ...appCtx.mousePosition() },
            );
        } else if (ev.key === "Escape") {
            setNewNodePopoverCoords(undefined);
        } else if (ev.key === "Delete") {
            [...editorCtx.getHighlightedNodes(), editorCtx.getInspectedNode()()?.id]
                .filter((x) => typeof x !== "undefined")
                .forEach((node) => materialCtx.removeNode(node!));
        }
    });

    return (
        <div
            class="relative h-full flex-1 overflow-hidden"
            style={{
                width: "100%",
                height: "100%",
                "background-image": "url(grid-bg.svg)",
                "background-position": `${dragOffset().x}px ${dragOffset().y}px`,
            }}
            onMouseDown={(ev) => {
                if (ev.button === 1) {
                    onMouseDown(ev);
                } else {
                    selectionManager.onMainAreaMouseDown(ev);
                }

                setNewNodePopoverCoords(undefined);
            }}
        >
            <Show when={newNodePopoverCoords()}>
                <MaterialGraphNewNodePopover
                    x={newNodePopoverCoords()!.x}
                    y={newNodePopoverCoords()!.y}
                    onClose={() => setNewNodePopoverCoords(undefined)}
                />
            </Show>

            {selectionManager.renderMultiselectBox()}

            <MaterialGraphEditorControls onCenter={() => setDragOffset({ x: 0, y: 0 })} />

            <div
                id="editor-root"
                class="w-full h-full"
                style={{
                    transform: `translate(${dragOffset().x}px, ${dragOffset().y}px)`,
                }}
            >
                <MaterialGraphEditorConnectionsOverlay />

                <For each={materialCtx.getNodes()}>
                    {(node) => <MaterialNodeBox node={() => node} />}
                </For>
            </div>
        </div>
    );
}

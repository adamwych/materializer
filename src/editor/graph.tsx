import { createSignal, For, Show } from "solid-js";
import { useAppContext } from "../app-context.ts";
import { Point2D } from "../types/point.ts";
import makeMouseMoveListener from "../utils/makeMouseMoveListener.ts";
import { clamp } from "../utils/math.ts";
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
    const [newNodePopoverCoords, setNewNodePopoverCoords] = createSignal<Point2D>();
    const dragOffset = editorCtx.dragOffset;
    const zoom = editorCtx.zoom;

    const registerPanMoveHandler = makeMouseMoveListener((ev) => {
        editorCtx.setDragOffset((offset) => ({
            x: Math.round(offset.x + ev.movementX / editorCtx.zoom()),
            y: Math.round(offset.y + ev.movementY / editorCtx.zoom()),
        }));
    });

    function setTargetZoom(callback: (zoom: number) => number) {
        editorCtx.setTargetZoom((zoom) => {
            return clamp(callback(zoom), 0.2, 2);
        });
    }

    function onWheel(ev: WheelEvent) {
        setTargetZoom((z) => z - ev.deltaY / 100 / 5);
    }

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
            id="editor-root"
            class="relative w-full h-full flex-1 overflow-hidden bg-gray-100"
            onWheel={onWheel}
            onMouseDown={(ev) => {
                if (ev.button === 1) {
                    registerPanMoveHandler(ev);
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

            <MaterialGraphEditorControls
                zoom={zoom()}
                onZoomIn={() => setTargetZoom((s) => s + 0.2)}
                onZoomOut={() => setTargetZoom((s) => s - 0.2)}
                onZoomReset={() => setTargetZoom((_) => 1)}
                onCenter={() => editorCtx.setDragOffset({ x: 0, y: 0 })}
            />

            <div
                class="absolute w-full h-full top-0 left-0 pointer-events-none"
                style={{
                    "background-image": "url(grid-bg.svg)",
                    "background-position": `${dragOffset().x * zoom()}px ${
                        dragOffset().y * zoom()
                    }px`,
                }}
            />

            <div
                id="editor-root"
                class="w-full h-full"
                style={{
                    transform: `scale(${zoom()}) translate(${dragOffset().x}px, ${
                        dragOffset().y
                    }px)`,
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

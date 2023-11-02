import { createSignal, For, onMount, Show } from "solid-js";
import { useAppContext } from "../app-context.ts";
import { Point2D } from "../types/point.ts";
import makeDeferredDragListener from "../utils/makeDeferredDragListener.ts";
import MaterialGraphEditorConnectionsOverlay from "./connections-overlay.tsx";
import { useEditorContext } from "./editor-context.ts";
import MaterialGraphEditorBackground from "./graph-background.tsx";
import MaterialGraphEditorControls from "./graph-controls.tsx";
import { useMaterialContext } from "./material-context.ts";
import MaterialGraphNewNodePopover from "./new-node-popover.tsx";
import MaterialNodeBox from "./node.tsx";
import { useEditorSelectionManager } from "./selection/manager.ts";
import { createEventListener } from "@solid-primitives/event-listener";
import { useWorkspaceContext } from "../workspace-context.ts";
import { useEditorPanZoomContext } from "./editor-pan-zoom-context.ts";

export default function MaterialGraphEditorNodes() {
    const appCtx = useAppContext()!;
    const selectionManager = useEditorSelectionManager()!;
    const materialCtx = useMaterialContext()!;
    const editorCtx = useEditorContext()!;
    const editorPanZoom = useEditorPanZoomContext()!;
    const workspace = useWorkspaceContext()!;
    const [newNodePopoverCoords, setNewNodePopoverCoords] = createSignal<Point2D>();
    const transformMatrixCss = () => {
        const m = [];
        m[3] = m[0] = editorPanZoom.smoothedZoom();
        m[2] = m[1] = 0;
        m[4] = editorPanZoom.smoothedOffset().x;
        m[5] = editorPanZoom.smoothedOffset().y;
        return `matrix(${m.join(",")})`;
    };

    const registerPanMoveHandler = makeDeferredDragListener((ev) => {
        editorPanZoom.move(ev.movementX, ev.movementY);
    });

    function onWheel(ev: WheelEvent) {
        const relativeX = ev.pageX;
        const relativeY = ev.pageY - 70;
        const isZoomingIn = ev.deltaY < 0;
        editorPanZoom.zoomAtOrigin(relativeX, relativeY, isZoomingIn ? 1.2 : 1 / 1.2);
    }

    createEventListener(window, "keydown", (ev) => {
        if (ev.key === "s" && ev.ctrlKey) {
            ev.preventDefault();
            workspace.saveActiveMaterial();
        }

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
            ref={(e) => onMount(() => editorPanZoom.setRootElement(e))}
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

            {selectionManager.renderSelectionRect()}

            <MaterialGraphEditorControls
                zoom={editorPanZoom.smoothedZoom()}
                onZoomIn={() => editorPanZoom.zoomAtCenter(1.2)}
                onZoomOut={() => editorPanZoom.zoomAtCenter(1 / 1.2)}
                onZoomReset={() => editorPanZoom.zoomAtCenter(1 / editorPanZoom.smoothedZoom())}
                onCenter={() => editorPanZoom.reset()}
            />

            <div
                id="editor-root"
                class="relative w-full h-full origin-top-left"
                style={{
                    transform: transformMatrixCss(),
                }}
            >
                <MaterialGraphEditorBackground />
                <MaterialGraphEditorConnectionsOverlay />

                <For each={materialCtx.getNodes()}>
                    {(node) => <MaterialNodeBox node={() => node} />}
                </For>
            </div>
        </div>
    );
}

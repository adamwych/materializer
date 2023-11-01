import { createSignal, For, Show } from "solid-js";
import { useAppContext } from "../app-context.ts";
import { Point2D } from "../types/point.ts";
import makeDeferredDragListener from "../utils/makeDeferredDragListener.ts";
import { clamp } from "../utils/math.ts";
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

const MIN_SCALE = 0.2;
const MAX_SCALE = 2;

export default function MaterialGraphEditorNodes() {
    const appCtx = useAppContext()!;
    const selectionManager = useEditorSelectionManager()!;
    const materialCtx = useMaterialContext()!;
    const editorCtx = useEditorContext()!;
    const workspace = useWorkspaceContext()!;
    const [newNodePopoverCoords, setNewNodePopoverCoords] = createSignal<Point2D>();
    const transformMatrix = () => {
        const m = [];
        m[3] = m[0] = editorCtx.smoothedZoom();
        m[2] = m[1] = 0;
        m[4] = editorCtx.smoothedOffset().x;
        m[5] = editorCtx.smoothedOffset().y;
        return m;
    };
    const transformMatrixCss = () => {
        const m = transformMatrix();
        return `matrix(${m[0]},${m[1]},${m[2]},${m[3]},${m[4]},${m[5]})`;
    };

    const registerPanMoveHandler = makeDeferredDragListener((ev) => {
        editorCtx.setPanZoomSettings(
            (settings) => ({
                scale: settings.scale,
                offset: {
                    x: Math.round(settings.offset.x + ev.movementX),
                    y: Math.round(settings.offset.y + ev.movementY),
                },
            }),
            false,
        );
    });

    function centerDragOffset() {
        editorCtx.setPanZoomSettings(() => ({
            scale: 1,
            offset: {
                x: -6900 / 2,
                y: -6900 / 2,
            },
        }));
    }

    function setZoom(callback: (zoom: number) => number) {
        editorCtx.setPanZoomSettings((settings) => ({
            scale: clamp(callback(settings.scale), MIN_SCALE, MAX_SCALE),
            offset: settings.offset,
        }));
    }

    function onWheel(ev: WheelEvent) {
        const relativeX = ev.pageX;
        const relativeY = ev.pageY - 70;
        const isZoomingIn = ev.deltaY < 0;
        const scaleMultiplier = isZoomingIn ? 1.2 : 1 / 1.2;

        editorCtx.setPanZoomSettings((settings) => {
            const newZoom = settings.scale * scaleMultiplier;
            if (newZoom < MIN_SCALE || newZoom > MAX_SCALE) {
                return settings;
            }

            return {
                scale: newZoom,
                offset: {
                    x: relativeX - (relativeX - settings.offset.x) * scaleMultiplier,
                    y: relativeY - (relativeY - settings.offset.y) * scaleMultiplier,
                },
            };
        });
    }

    createEventListener(window, "keydown", (ev) => {
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
        } else if (ev.key === "s" && ev.ctrlKey) {
            ev.preventDefault();
            ev.stopPropagation();
            workspace.saveActiveMaterial();
        }
    });

    return (
        <div
            ref={(e) => editorCtx.setRootElement(e)}
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
                zoom={editorCtx.smoothedZoom()}
                onZoomIn={() => setZoom((s) => s + 0.2)}
                onZoomOut={() => setZoom((s) => s - 0.2)}
                onZoomReset={() => setZoom((_) => 1)}
                onCenter={centerDragOffset}
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

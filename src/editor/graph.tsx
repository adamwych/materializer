import { createSignal, For, Show } from "solid-js";
import MaterialNodeBox from "./node.tsx";
import MaterialGraphEditorConnectionsOverlay from "./connections-overlay.tsx";
import { useEditorSelectionManager } from "./selection/manager.ts";
import { Point2D } from "../types/point.ts";
import MaterialGraphNewNodePopover from "./new-node-popover.tsx";
import { useMaterialContext } from "./material-context.ts";
import { useEditorContext } from "./editor-context.ts";

export default function MaterialGraphEditorNodes() {
    const selectionManager = useEditorSelectionManager()!;
    const materialCtx = useMaterialContext()!;
    const editorCtx = useEditorContext()!;
    const [lastMousePosition, setLastMousePosition] = createSignal<Point2D>({
        x: 0,
        y: 0,
    });
    const [newNodePopoverCoords, setNewNodePopoverCoords] = createSignal<Point2D>();

    window.addEventListener("mousemove", (ev) => {
        setLastMousePosition({ x: ev.pageX, y: ev.pageY });
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
            setNewNodePopoverCoords((coords) => (coords ? undefined : { ...lastMousePosition() }));
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
            class="relative h-full flex-1 overflow-hidden"
            style={{
                "background-image": "url(grid-bg.svg)",
            }}
            onMouseDown={(ev) => {
                selectionManager.onMainAreaMouseDown(ev);
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

            <MaterialGraphEditorConnectionsOverlay />

            <For each={materialCtx.getNodes()}>
                {(node) => <MaterialNodeBox node={() => node} />}
            </For>
        </div>
    );
}

import { createSignal, For, Show } from "solid-js";
import MaterialNodeBox from "./node.tsx";
import MaterialGraphEditorConnectionsOverlay from "./connections-overlay.tsx";
import { useEditorSelectionManager } from "./selection/manager.ts";
import { Point2D } from "../types/point.ts";
import MaterialGraphEditorAddNodePopover from "./new-node-popover.tsx";
import { useMaterialContext } from "./material-context.ts";

export default function MaterialGraphEditorNodes() {
    const selectionManager = useEditorSelectionManager()!;
    const materialCtx = useMaterialContext()!;
    const [lastMousePosition, setLastMousePosition] = createSignal<Point2D>({
        x: 0,
        y: 0,
    });
    const [newNodePopoverCoords, setNewNodePopoverCoords] = createSignal<Point2D>();

    window.addEventListener("mousemove", (ev) => {
        setLastMousePosition({ x: ev.pageX, y: ev.pageY });
    });

    window.addEventListener("keyup", (ev) => {
        if (ev.key === " ") {
            setNewNodePopoverCoords({ ...lastMousePosition() });
        } else if (ev.key === "Escape") {
            setNewNodePopoverCoords(undefined);
        }
    });

    return (
        <div
            class="relative w-full h-full overflow-hidden"
            style={{
                "background-image": "url(grid-bg.svg)",
            }}
            onMouseDown={(ev) => {
                selectionManager.onMainAreaMouseDown(ev);
                setNewNodePopoverCoords(undefined);
            }}
        >
            <Show when={newNodePopoverCoords()}>
                <MaterialGraphEditorAddNodePopover
                    x={newNodePopoverCoords()!.x}
                    y={newNodePopoverCoords()!.y}
                    onClose={() => setNewNodePopoverCoords(undefined)}
                />
            </Show>

            {selectionManager.renderMultiselectBox()}

            <MaterialGraphEditorConnectionsOverlay />

            <For each={materialCtx.getNodes()}>{(node) => <MaterialNodeBox node={() => node} />}</For>
        </div>
    );
}

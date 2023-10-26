import { Point2D } from "../../types/point.ts";
import { useEditorContext } from "../editor-context.ts";
import { createSignal } from "solid-js";
import { useMaterialContext } from "../material-context.ts";

type TouchDownInfo = {
    nodeId: number;
    coords: Point2D;
};

export default function createSingleSelectHandler() {
    const editorCtx = useEditorContext()!;
    const materialCtx = useMaterialContext()!;
    const [touchDownInfo, setTouchDownInfo] = createSignal<TouchDownInfo>();

    function onMouseMove(ev: MouseEvent) {
        ev.stopPropagation();
        const info = touchDownInfo()!;
        materialCtx.moveNode(info.nodeId, ev.movementX, ev.movementY);
    }

    function onMouseUp(ev: MouseEvent) {
        ev.stopPropagation();

        // If we've not moved far from the initial touch down position, then
        // interpret it as a click.
        const info = touchDownInfo()!;
        const movedDistance = Math.abs(ev.pageX - info.coords.x) + Math.abs(ev.pageY - info.coords.y);
        if (movedDistance <= 10) {
            editorCtx.inspectNode(info.nodeId);
        }

        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
        setTouchDownInfo(undefined);
    }

    return {
        onMouseDown(ev: MouseEvent, nodeId: number) {
            ev.stopPropagation();

            editorCtx.clearHighlight();

            setTouchDownInfo({
                nodeId,
                coords: { x: ev.pageX, y: ev.pageY },
            });

            window.addEventListener("mousemove", onMouseMove);
            window.addEventListener("mouseup", onMouseUp);
        },
        deselectAll() {
            editorCtx.setHighlightedNodes([]);
            setTouchDownInfo(undefined);
        },
    };
}

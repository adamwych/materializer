import { useEditorContext } from "../editor-context.ts";
import { useMaterialContext } from "../material-context.ts";
import makeDragListener from "../../utils/makeDragListener.ts";
import { useEditorPanZoomContext } from "../editor-pan-zoom-context.ts";

export default function createSingleSelectHandler() {
    const editorCtx = useEditorContext()!;
    const editorPanZoom = useEditorPanZoomContext()!;
    const materialCtx = useMaterialContext()!;

    return {
        onMouseDown(downEvent: MouseEvent, nodeId: number) {
            downEvent.stopPropagation();
            editorCtx.clearHighlight();

            makeDragListener(
                (moveEvent) => {
                    materialCtx.moveNode(
                        nodeId,
                        moveEvent.movementX / editorPanZoom.smoothedZoom(),
                        moveEvent.movementY / editorPanZoom.smoothedZoom(),
                    );
                },
                (upEvent) => {
                    // If we've not moved far from the initial touch down position, then
                    // interpret it as a click.
                    const movedDistance =
                        Math.abs(upEvent.pageX - downEvent.pageX) +
                        Math.abs(upEvent.pageY - downEvent.pageY);
                    if (movedDistance <= 10) {
                        editorCtx.inspectNode(nodeId);
                    }
                },
            );
        },
        deselectAll() {
            editorCtx.clearHighlight();
        },
    };
}

import { createSignal } from "solid-js";
import { rectIntersects } from "../../utils/math.ts";
import { useEditorContext } from "../editor-context.ts";
import { useMaterialContext } from "../material-context.ts";
import MaterialGraphEditorSelectionRect from "./multi-select-box.tsx";
import makeDragListener from "../../utils/makeDragListener.ts";
import { useEditorPanZoomContext } from "../editor-pan-zoom-context.ts";

export default function createMultiSelectManager() {
    const editorCtx = useEditorContext()!;
    const editorPanZoom = useEditorPanZoomContext()!;
    const materialCtx = useMaterialContext()!;
    const [selectionRect, setSelectionRect] = createSignal<DOMRect>();

    function registerSelectionDragListener(downEvent: MouseEvent) {
        makeDragListener(
            (moveEvent) => {
                const rect = new DOMRect(
                    moveEvent.pageX < downEvent.pageX ? moveEvent.pageX : downEvent.pageX,
                    moveEvent.pageY < downEvent.pageY ? moveEvent.pageY : downEvent.pageY,
                    Math.abs(moveEvent.pageX - downEvent.pageX),
                    Math.abs(moveEvent.pageY - downEvent.pageY),
                );

                const intersectingNodes = findNodesWithinRect(rect);

                editorCtx.setHighlightedNodes(intersectingNodes.map((x) => x.id));
                setSelectionRect(rect);
            },
            (upEvent) => {
                const movedDistance =
                    Math.abs(upEvent.pageX - downEvent.pageX) +
                    Math.abs(upEvent.pageY - downEvent.pageY);
                if (movedDistance <= 10) {
                    editorCtx.inspectNode(undefined);
                    editorCtx.setHighlightedNodes([]);
                }

                setSelectionRect(undefined);
            },
        );
    }

    function registerGroupMoveListener() {
        makeDragListener((moveEvent) => {
            const nodes = editorCtx.getHighlightedNodes().map((id) => materialCtx.getNodeById(id));
            for (const node of nodes) {
                if (node) {
                    materialCtx.moveNode(
                        node.id,
                        moveEvent.movementX / editorPanZoom.smoothedZoom(),
                        moveEvent.movementY / editorPanZoom.smoothedZoom(),
                    );
                }
            }
        });
    }

    function findNodesWithinRect(rect: DOMRect) {
        return materialCtx.getNodes().filter((node) => {
            const element = editorCtx.getNodeElement(node.id);
            return element ? rectIntersects(element.getBoundingClientRect(), rect) : false;
        });
    }

    return {
        renderSelectionRect() {
            return (
                <MaterialGraphEditorSelectionRect
                    x={selectionRect()?.left || 0}
                    y={selectionRect()?.top || 0}
                    width={selectionRect()?.width || 0}
                    height={selectionRect()?.height || 0}
                />
            );
        },
        onMainAreaMouseDown(ev: MouseEvent) {
            ev.stopPropagation();
            editorCtx.inspectNode(undefined);
            registerSelectionDragListener(ev);
        },
        onNodeMouseDown(ev: MouseEvent) {
            ev.stopPropagation();
            registerGroupMoveListener();
        },
        deselectAll() {
            editorCtx.setHighlightedNodes([]);
        },
        isNodeSelected(nodeId: number) {
            return editorCtx.getHighlightedNodes().includes(nodeId);
        },
    };
}

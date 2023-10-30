import { createSignal } from "solid-js";
import { MaterialNode } from "../../types/material.ts";
import { Point2D } from "../../types/point.ts";
import { rectIntersects } from "../../utils/math.ts";
import { useEditorContext } from "../editor-context.ts";
import { useMaterialContext } from "../material-context.ts";
import MaterialGraphEditorMultiselectBox from "./multi-select-box.tsx";

export default function createMultiSelectManager() {
    const editorCtx = useEditorContext()!;
    const materialCtx = useMaterialContext()!;
    const [touchDownPoint, setTouchDownPoint] = createSignal<Point2D>();
    const [boxRect, setBoxRect] = createSignal<DOMRect>();
    const [highlightedNodes, setHighlightedNodes] = createSignal<Array<MaterialNode>>([]);

    function calculateSelectionBoxRect(mouseX: number, mouseY: number) {
        const startPoint = touchDownPoint()!;
        return new DOMRect(
            mouseX < startPoint.x ? mouseX : startPoint.x,
            mouseY < startPoint.y ? mouseY : startPoint.y,
            Math.abs(mouseX - startPoint.x),
            Math.abs(mouseY - startPoint.y),
        );
    }

    function onMouseMove(ev: MouseEvent) {
        ev.stopPropagation();

        const rect = calculateSelectionBoxRect(ev.pageX, ev.pageY);
        const intersectingNodes = materialCtx.getNodes().filter((node) => {
            const element = editorCtx.getNodeElement(node.id);
            if (!element) {
                return false;
            }

            const elementRect = element.getBoundingClientRect();
            return rectIntersects(elementRect, rect);
        });

        setHighlightedNodes(intersectingNodes);
        editorCtx.setHighlightedNodes(intersectingNodes.map((x) => x.id));
        setBoxRect(rect);
    }

    function onMouseUp(ev: MouseEvent) {
        ev.stopPropagation();

        const point = touchDownPoint()!;
        const movedDistance = Math.abs(ev.pageX - point.x) + Math.abs(ev.pageY - point.y);
        if (movedDistance <= 10) {
            editorCtx.inspectNode(undefined);
            editorCtx.setHighlightedNodes([]);
            setHighlightedNodes([]);
        }

        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
        setBoxRect(undefined);
    }

    function onNodeMouseMove(ev: MouseEvent) {
        ev.stopPropagation();

        const nodes = highlightedNodes();
        for (const node of nodes) {
            materialCtx.moveNode(
                node.id,
                ev.movementX / editorCtx.zoom(),
                ev.movementY / editorCtx.zoom(),
            );
        }
    }

    function onNodeMouseUp(ev: MouseEvent) {
        ev.stopPropagation();
        window.removeEventListener("mousemove", onNodeMouseMove);
        window.removeEventListener("mouseup", onNodeMouseUp);
    }

    return {
        renderMultiselectBox() {
            return (
                <MaterialGraphEditorMultiselectBox
                    x={boxRect()?.left || 0}
                    y={boxRect()?.top || 0}
                    width={boxRect()?.width || 0}
                    height={boxRect()?.height || 0}
                />
            );
        },
        onMouseDown(ev: MouseEvent) {
            ev.stopPropagation();
            setTouchDownPoint({ x: ev.pageX, y: ev.pageY });
            window.addEventListener("mousemove", onMouseMove);
            window.addEventListener("mouseup", onMouseUp);
        },
        onNodeMouseDown(ev: MouseEvent) {
            ev.stopPropagation();
            window.addEventListener("mousemove", onNodeMouseMove);
            window.addEventListener("mouseup", onNodeMouseUp);
        },
        deselectAll() {
            editorCtx.setHighlightedNodes([]);
            setHighlightedNodes([]);
        },
        isNodeSelected(nodeId: number) {
            return highlightedNodes()?.find((x) => x.id === nodeId);
        },
    };
}

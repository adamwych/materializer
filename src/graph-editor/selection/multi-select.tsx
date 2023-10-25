import { useEditorRuntimeContext } from "../runtime-context.tsx";
import { createSignal } from "solid-js";
import { Point2D } from "../../types/point.ts";
import UIMaterialGraphEditorMultiselectBox from "./multi-select-box.tsx";
import { MaterialNode } from "../../types/material.ts";
import { useEditorMaterialContext } from "../material-context.ts";

export default function createMultiSelectHandler() {
    const editorCtx = useEditorRuntimeContext();
    const materialCtx = useEditorMaterialContext()!;
    const [touchDownPoint, setTouchDownPoint] = createSignal<Point2D>();
    const [boxRect, setBoxRect] = createSignal<DOMRect>();
    const [highlightedNodes, setHighlightedNodes] = createSignal<
        Array<MaterialNode>
    >([]);

    function onMouseMove(ev: MouseEvent) {
        ev.stopPropagation();

        const menuBarHeight = 70;
        const startPoint = touchDownPoint()!;
        const rect = new DOMRect(
            startPoint.x,
            startPoint.y - menuBarHeight,
            ev.pageX - startPoint.x,
            ev.pageY - startPoint.y,
        );

        const intersectingNodes = materialCtx
            .getNodes()
            .filter((node) => {
                return (
                    node.x >= rect.x &&
                    node.x <= rect.x + rect.width &&
                    node.y >= rect.y &&
                    node.y <= rect.y + rect.height
                );
            })
            .map((x) => x);

        setHighlightedNodes(intersectingNodes);
        editorCtx.setHighlightedNodes(intersectingNodes.map((x) => x.id));
        setBoxRect(rect);
    }

    function onMouseUp(ev: MouseEvent) {
        ev.stopPropagation();

        const point = touchDownPoint()!;
        const movedDistance =
            Math.abs(ev.pageX - point.x) + Math.abs(ev.pageY - point.y);
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
            materialCtx.translateNode(node.id, ev.movementX, ev.movementY);
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
                <UIMaterialGraphEditorMultiselectBox
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

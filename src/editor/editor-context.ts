import { Accessor, createSignal } from "solid-js";
import { MaterialNode } from "../types/material.ts";
import { ReactiveMap } from "@solid-primitives/map";
import { useMaterialContext } from "./material-context.ts";
import { createContextProvider } from "@solid-primitives/context";
import { Point2D } from "../types/point.ts";
import createTween from "@solid-primitives/tween";

export const [EditorContextProvider, useEditorContext] = createContextProvider(() => {
    const materialCtx = useMaterialContext()!;
    const [highlightedNodes, setHighlightedNodes] = createSignal<Array<number>>([]);
    const [inspectedNodeId, setInspectedNodeId] = createSignal<number>();
    const nodeElements = new ReactiveMap<number, HTMLElement>();
    const [dragOffset, setDragOffset] = createSignal<Point2D>({ x: 0, y: 0 });
    const [targetZoom, setTargetZoom] = createSignal(1);
    const zoom = createTween(targetZoom, { duration: 200 });

    return {
        updateNodeBoxElement(nodeId: number, element: HTMLElement) {
            nodeElements.set(nodeId, element);
        },

        getNodeElement(nodeId: number): HTMLElement | undefined {
            return nodeElements.get(nodeId);
        },

        getNodeSocketElement(nodeId: number, socketId: string): HTMLElement | null | undefined {
            return nodeElements.get(nodeId)?.querySelector(`[data-socket=${socketId}`);
        },

        setHighlightedNodes(ids: Array<number>) {
            setHighlightedNodes(ids);
        },

        getHighlightedNodes() {
            return highlightedNodes();
        },

        isNodeHighlighted(id: number) {
            return highlightedNodes().includes(id);
        },

        clearHighlight() {
            setHighlightedNodes([]);
        },

        inspectNode(id?: number) {
            setInspectedNodeId(id);
        },

        getInspectedNode(): Accessor<MaterialNode | undefined> {
            return () => materialCtx.getNodeById(inspectedNodeId()!);
        },

        dragOffset,
        setDragOffset,
        targetZoom,
        setTargetZoom,
        zoom,
    };
});

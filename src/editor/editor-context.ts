import { Accessor, createSignal } from "solid-js";
import { MaterialNode } from "../types/material.ts";
import { ReactiveMap } from "@solid-primitives/map";
import { useMaterialContext } from "./material-context.ts";
import { createContextProvider } from "@solid-primitives/context";

export const [EditorContextProvider, useEditorContext] = createContextProvider(() => {
    const materialCtx = useMaterialContext()!;
    const [highlightedNodes, setHighlightedNodes] = createSignal<Array<number>>([]);
    const [inspectedNodeId, setInspectedNodeId] = createSignal<number>();
    const nodeElements = new ReactiveMap<number, HTMLElement>();

    return {
        updateNodeBoxElement(nodeId: number, element: HTMLElement) {
            nodeElements.set(nodeId, element);
        },

        getNodeSocketElement(nodeId: number, socketId: string): HTMLElement | null | undefined {
            return nodeElements.get(nodeId)?.querySelector(`[data-socket=${socketId}`);
        },

        setHighlightedNodes(ids: Array<number>) {
            setHighlightedNodes(ids);
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
    };
});

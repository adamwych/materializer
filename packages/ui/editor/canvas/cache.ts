import { createContextProvider } from "@solid-primitives/context";
import { ReactiveMap } from "@solid-primitives/map";
import { useMaterialStore } from "../../../stores/material";
import { useWorkspaceStore } from "../../../stores/workspace";
import { rectIntersects } from "../../../utils/math";

export const [EditorRuntimeCache, useEditorRuntimeCache] = createContextProvider(() => {
    const materialStore = useMaterialStore()!;
    const material = useWorkspaceStore()!.getActiveMaterial()!;
    const nodeElements = new ReactiveMap<number, HTMLElement>();
    const socketElements = new ReactiveMap<string, HTMLElement>();

    materialStore.getEvents().on("nodeRemoved", (ev) => {
        nodeElements.delete(ev.node.id);
    });

    return {
        getNodesWithinRect(rect: DOMRect) {
            return Array.from(material.nodes.values()).filter((node) => {
                const element = nodeElements.get(node.id);
                return element ? rectIntersects(element.getBoundingClientRect(), rect) : false;
            });
        },

        setNodeDOMElement(nodeId: number, element: HTMLElement) {
            nodeElements.set(nodeId, element);
        },

        getNodeDOMElement(nodeId: number) {
            return nodeElements.get(nodeId);
        },

        setNodeSocketDOMElement(nodeId: number, socketId: string, element: HTMLElement) {
            socketElements.set(`${nodeId}-${socketId}`, element);
        },

        getNodeSocketDOMElement(nodeId: number, socketId: string) {
            return socketElements.get(`${nodeId}-${socketId}`);
        },
    };
});

export type IEditorRuntimeCache = NonNullable<ReturnType<typeof useEditorRuntimeCache>>;

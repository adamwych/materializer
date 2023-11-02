import { createContextProvider } from "@solid-primitives/context";
import { ReactiveMap } from "@solid-primitives/map";
import createRAF from "@solid-primitives/raf";
import { Accessor, createSignal, onMount } from "solid-js";
import { MaterialNode } from "../types/material.ts";
import { Point2D } from "../types/point.ts";
import { useMaterialContext } from "./material-context.ts";
import { clamp } from "../utils/math.ts";

export type EditorPanZoomSettings = {
    offset: Point2D;
    scale: number;
};

function createPanZoomSettings() {
    const [settings, setSettings] = createSignal<EditorPanZoomSettings>({
        offset: { x: -6900 / 2, y: -6900 / 2 },
        scale: 1,
    });
    const [smoothedSettings, setSmoothedSettings] = createSignal(settings());

    const [_, start, __] = createRAF(() => {
        function tween(start: number, end: number, t: number) {
            return start + (end - start) * t;
        }

        setSmoothedSettings((smoothedSettings) => ({
            offset: {
                x: tween(smoothedSettings.offset.x, settings().offset.x, 0.1),
                y: tween(smoothedSettings.offset.y, settings().offset.y, 0.1),
            },
            scale: tween(smoothedSettings.scale, settings().scale, 0.1),
        }));
    });

    start();

    return {
        settings,
        setSettings,
        smoothedSettings,
        setSmoothedSettings,
    };
}

export const [EditorContextProvider, useEditorContext] = createContextProvider(() => {
    const materialCtx = useMaterialContext()!;
    const [highlightedNodes, setHighlightedNodes] = createSignal<Array<number>>([]);
    const [inspectedNodeId, setInspectedNodeId] = createSignal<number>();
    const nodeElements = new ReactiveMap<number, HTMLElement>();
    const panZoomSettings = createPanZoomSettings();
    let rootElement: HTMLElement;

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

        setRootElement(element: HTMLElement) {
            rootElement = element;
            this.setPanZoomSettings((settings) => {
                settings.offset.x += Math.round(element.clientWidth / 2);
                settings.offset.y += Math.round((element.clientHeight - 70) / 2);
                return settings;
            }, false);
        },

        setPanZoomSettings(
            builder: (current: EditorPanZoomSettings) => EditorPanZoomSettings,
            animate = true,
        ) {
            panZoomSettings.setSettings((settings) => {
                const newSettings = builder(settings);
                const scaledCanvasWidth = 6900 * newSettings.scale;
                const scaledCanvasHeight = 6900 * newSettings.scale;
                const minX = -(scaledCanvasWidth - rootElement.clientWidth);
                const minY = -(scaledCanvasHeight - rootElement.clientHeight);

                newSettings.offset.x = clamp(newSettings.offset.x, minX, 0);
                newSettings.offset.y = clamp(newSettings.offset.y, minY, 0);

                if (!animate) {
                    panZoomSettings.setSmoothedSettings(newSettings);
                }

                return newSettings;
            });
        },

        smoothedZoom: () => panZoomSettings.smoothedSettings().scale,
        smoothedOffset: () => panZoomSettings.smoothedSettings().offset,
    };
});

import { createContextProvider } from "@solid-primitives/context";
import { batch, createSignal } from "solid-js";
import { Point2D } from "../types/point.ts";
import {
    EDITOR_GRAPH_HEIGHT,
    EDITOR_GRAPH_WIDTH,
    EDITOR_MAX_ZOOM,
    EDITOR_MIN_ZOOM,
} from "./constants.ts";
import { clamp } from "../utils/math.ts";
import createSettableTween from "../utils/createSettableTween.ts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tweenSettings = { ease: (_: any) => 0.1 as any, duration: 500 };

export const [EditorPanZoomProvider, useEditorPanZoomContext] = createContextProvider(() => {
    let rootElement: HTMLElement;
    const [offsetX, setOffsetX] = createSignal(0);
    const [offsetY, setOffsetY] = createSignal(0);
    const [scale, setScale] = createSignal(1);
    const [smoothOffsetX, setSmoothOffsetX] = createSettableTween(offsetX, tweenSettings);
    const [smoothOffsetY, setSmoothOffsetY] = createSettableTween(offsetY, tweenSettings);
    const [smoothScale, setSmoothScale] = createSettableTween(scale, tweenSettings);

    // Clamp functions make sure that the offset doesn't not go outside of
    // the virtual viewport's bounds.

    function clampOffsetX(x: number, scale: number) {
        const scaledCanvasWidth = EDITOR_GRAPH_WIDTH * scale;
        const minX = -(scaledCanvasWidth - rootElement.clientWidth);
        return Math.round(clamp(x, minX, 0));
    }

    function clampOffsetY(y: number, scale: number) {
        const scaledCanvasHeight = EDITOR_GRAPH_HEIGHT * scale;
        const minY = -(scaledCanvasHeight - rootElement.clientHeight);
        return Math.round(clamp(y, minY, 0));
    }

    function tweenImmediately() {
        setSmoothOffsetX(offsetX());
        setSmoothOffsetY(offsetY());
        setSmoothScale(scale());
    }

    return {
        /**
         * Moves view by given amount on X and Y axis.
         *
         * @param x
         * @param y
         */
        move(x: number, y: number) {
            batch(() => {
                setOffsetX((cx) => clampOffsetX(cx + x, scale()));
                setOffsetY((cy) => clampOffsetY(cy + y, scale()));
                tweenImmediately();
            });
        },

        /**
         * Scales view by given multiplier from given origin point.
         *
         * @param originX
         * @param originY
         * @param multiplier
         * @param animate
         */
        zoomAtOrigin(originX: number, originY: number, multiplier: number, animate = true) {
            const newScale = scale() * multiplier;
            if (newScale < EDITOR_MIN_ZOOM || newScale > EDITOR_MAX_ZOOM) {
                return;
            }

            batch(() => {
                setScale(newScale);
                setOffsetX((x) => clampOffsetX(originX - (originX - x) * multiplier, newScale));
                setOffsetY((y) => clampOffsetY(originY - (originY - y) * multiplier, newScale));

                if (!animate) {
                    tweenImmediately();
                }
            });
        },

        /**
         * Scales view by given multiplier from its center point.
         * @param multiplier
         * @param animate
         */
        zoomAtCenter(multiplier: number, animate = true) {
            this.zoomAtOrigin(
                rootElement.clientWidth / 2,
                rootElement.clientHeight / 2,
                multiplier,
                animate,
            );
        },

        /**
         * Resets zoom to 1 and centers the view so that point [0, 0] in graph-space is
         * in the center of the screen.
         *
         * @param animate
         */
        reset(animate = true) {
            batch(() => {
                setScale(1);
                setOffsetX(-EDITOR_GRAPH_WIDTH / 2 + Math.round(rootElement.clientWidth / 2));
                setOffsetY(-EDITOR_GRAPH_HEIGHT / 2 + Math.round(rootElement.clientHeight / 2));

                if (!animate) {
                    tweenImmediately();
                }
            });
        },

        /**
         * Maps 2D coordinates from page-space to graph-space.
         *
         * @param pageX
         * @param pageY
         * @returns
         */
        mapCoordsToGraphSpace(pageX: number, pageY: number): Point2D {
            return {
                x: (pageX - smoothOffsetX()) / smoothScale(),
                y: (pageY - smoothOffsetY() - rootElement.offsetTop) / smoothScale(),
            };
        },

        smoothedZoom: () => smoothScale(),
        smoothedOffset: () => ({ x: smoothOffsetX(), y: smoothOffsetY() }),

        setRootElement(element: HTMLElement) {
            rootElement = element;
            this.reset(false);
        },
    };
});

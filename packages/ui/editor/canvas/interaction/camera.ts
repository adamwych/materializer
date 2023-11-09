import { createContextProvider } from "@solid-primitives/context";
import { batch, createSignal } from "solid-js";
import createSettableTween from "../../../../utils/createSettableTween";
import { Point2D, clamp } from "../../../../utils/math";
import {
    EDITOR_GRAPH_HEIGHT,
    EDITOR_GRAPH_WIDTH,
    EDITOR_MAX_ZOOM,
    EDITOR_MIN_ZOOM,
} from "../../consts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tweenSettings = { ease: (_: any) => 0.1 as any, duration: 500 };

export const [EditorCameraState, useEditorCameraState] = createContextProvider(() => {
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
         * Resets zoom to 1 and centers the view so that the point [0, 0] is
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
         * Maps given coordinates from graph-space to page-space.
         *
         * @param graphX
         * @param graphY
         * @returns
         */
        mapCoordsToScreenSpace(graphX: number, graphY: number): Point2D {
            const graphSpaceOffsetX = -smoothOffsetX() / smoothScale() / EDITOR_GRAPH_WIDTH;
            const normalizedGraphX = graphX / smoothScale() / EDITOR_GRAPH_WIDTH;
            const graphSpaceOffsetY = -smoothOffsetY() / smoothScale() / EDITOR_GRAPH_HEIGHT;
            const normalizedGraphY = graphY / smoothScale() / EDITOR_GRAPH_HEIGHT;

            return {
                x: (normalizedGraphX - graphSpaceOffsetX) * EDITOR_GRAPH_WIDTH,
                y: (normalizedGraphY - graphSpaceOffsetY) * EDITOR_GRAPH_HEIGHT,
            };
        },

        /**
         * Maps given coordinates from page-space to graph-space.
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

        /**
         * Returns coordinates of the graph point, that is currently
         * at the center of the editor view.
         */
        getScreenCenterPoint() {
            return {
                x: (smoothOffsetX() - rootElement.clientWidth / 2) / smoothScale(),
                y: (smoothOffsetY() - rootElement.clientHeight / 2) / smoothScale(),
            };
        },

        smoothScale,
        smoothOffsetX,
        smoothOffsetY,
        transformMatrixCss: () => {
            const m = [];
            m[3] = m[0] = smoothScale();
            m[2] = m[1] = 0;
            m[4] = smoothOffsetX();
            m[5] = smoothOffsetY();
            return `matrix(${m.join(",")})`;
        },

        setRootElement(element: HTMLElement) {
            rootElement = element;
            this.reset(false);
        },
    };
});

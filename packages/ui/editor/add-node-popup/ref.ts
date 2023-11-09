import { createContextProvider } from "@solid-primitives/context";
import { createSignal } from "solid-js";
import { Point2D } from "../../../utils/math";
import { MaterialNode } from "../../../material/node";

type Result = MaterialNode | undefined;

/**
 * Provides global access to information about the {@link EditorAddNodePopup} component.
 */
export const [EditorAddNodePopupRef, useEditorAddNodePopupRef] = createContextProvider(() => {
    const [coords, setCoords] = createSignal<Point2D>();
    let resolveFn: ((value?: Result) => void) | undefined;

    return {
        /**
         * Opens the popup at given location.
         * Returns a Promise, that resolves once the popup is closed.
         *
         * @param x
         * @param y
         */
        show(x: number, y: number) {
            return new Promise<Result>((resolve) => {
                setCoords({ x, y });
                resolveFn = resolve;
            });
        },

        /**
         * Hides the popup.
         */
        hide(result?: Result) {
            setCoords(undefined);
            resolveFn?.(result);
            resolveFn = undefined;
        },

        isVisible: () => typeof coords() !== "undefined",
        coords,
    };
});

export type IEditorAddNodePopupRef = NonNullable<ReturnType<typeof useEditorAddNodePopupRef>>;

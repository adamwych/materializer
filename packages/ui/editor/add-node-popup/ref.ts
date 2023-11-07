import { createContextProvider } from "@solid-primitives/context";
import { createSignal } from "solid-js";
import { Point2D } from "../../../utils/math";

/**
 * Provides global access to information about the {@link EditorAddNodePopup} component.
 */
export const [EditorAddNodePopupRef, useEditorAddNodePopupRef] = createContextProvider(() => {
    const [coords, setCoords] = createSignal<Point2D>();

    return {
        show: (x: number, y: number) => setCoords({ x, y }),
        hide: () => setCoords(undefined),
        isVisible: () => typeof coords() !== "undefined",
        coords,
    };
});

export type IEditorAddNodePopupRef = NonNullable<ReturnType<typeof useEditorAddNodePopupRef>>;

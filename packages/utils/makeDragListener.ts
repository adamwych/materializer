import { makeEventListener } from "@solid-primitives/event-listener";

export default function makeDragListener(
    moveHandler: (ev: PointerEvent) => void,
    upHandler?: (ev: PointerEvent) => void,
    oneShot = true,
) {
    const clearMouseMoveListener = makeEventListener(window, "pointermove", (ev) => {
        ev.stopPropagation();
        moveHandler(ev);
    });

    const clearMouseUpListener = makeEventListener(window, "pointerup", (ev) => {
        ev.stopPropagation();
        upHandler?.(ev);

        if (oneShot) {
            clearMouseMoveListener();
            clearMouseUpListener();
        }
    });

    return () => {
        clearMouseMoveListener();
        clearMouseUpListener();
    };
}

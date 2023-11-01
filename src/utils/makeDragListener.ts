import { makeEventListener } from "@solid-primitives/event-listener";

export default function makeDragListener(
    moveHandler: (ev: MouseEvent) => void,
    upHandler?: (ev: MouseEvent) => void,
) {
    const clearMouseMoveListener = makeEventListener(window, "mousemove", (ev) => {
        ev.stopPropagation();
        moveHandler(ev);
    });

    const clearMouseUpListener = makeEventListener(window, "mouseup", (ev) => {
        ev.stopPropagation();
        upHandler?.(ev);
        clearMouseMoveListener();
        clearMouseUpListener();
    });
}

import makeDeferredEventListener from "./makeDeferredEventListener";

export default function makeDeferredDragListener(
    moveHandler: (ev: MouseEvent) => void,
    upHandler?: (ev: MouseEvent) => void,
) {
    const [registerMouseMoveListener, clearMouseMoveListener] = makeDeferredEventListener(
        window,
        "mousemove",
        (ev) => {
            moveHandler(ev);
        },
    );

    const [registerMouseUpListener, clearMouseUpListener] = makeDeferredEventListener(
        window,
        "mouseup",
        (ev) => {
            upHandler?.(ev);
            clearMouseMoveListener();
            clearMouseUpListener();
        },
    );

    return (ev: MouseEvent) => {
        moveHandler(ev);
        registerMouseMoveListener();
        registerMouseUpListener();
    };
}

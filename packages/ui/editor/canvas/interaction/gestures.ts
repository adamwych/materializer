import { createContextProvider } from "@solid-primitives/context";
import { useEditorCameraState } from "./camera";
import { Point2D, distance2d } from "../../../../utils/math";
import makeDragListener from "../../../../utils/makeDragListener";

enum GestureType {
    Pan,
    PinchZoom,
    None,
}

export const [EditorGesturesHandler, useEditorGesturesHandler] = createContextProvider(() => {
    const cameraState = useEditorCameraState()!;
    const pointerStates = new Map<number, Point2D>();
    let currentGesture = GestureType.None;
    let lastPinchZoomDistance = 1;
    let justStartedPinchZoom = true;

    function processPan(ev: PointerEvent) {
        const pointerState = pointerStates.get(ev.pointerId)!;
        const movementX = ev.pageX - pointerState.x;
        const movementY = ev.pageY - pointerState.y;
        cameraState.move(movementX, movementY);
        pointerState.x = ev.pageX;
        pointerState.y = ev.pageY;
    }

    function processPinchZoom(ev: PointerEvent) {
        const pointers = Array.from(pointerStates.entries());
        const evPointerState = pointers.find(([id]) => id === ev.pointerId)![1];
        const otherPointerState = pointers.find(([id]) => id !== ev.pointerId)![1];

        evPointerState.x = ev.pageX;
        evPointerState.y = ev.pageY;

        const lowerX = Math.min(evPointerState.x, otherPointerState.x);
        const higherX = Math.max(evPointerState.x, otherPointerState.x);
        const centerPointX = lowerX + (higherX - lowerX) / 2;

        const lowerY = Math.min(evPointerState.y, otherPointerState.y);
        const higherY = Math.max(evPointerState.y, otherPointerState.y);
        const centerPointY = lowerY + (higherY - lowerY) / 2;

        const distance = distance2d(lowerX, lowerY, higherX, higherY);

        if (!justStartedPinchZoom) {
            cameraState.zoomAtOrigin(
                centerPointX,
                centerPointY - 70,
                distance / lastPinchZoomDistance,
            );
        }

        lastPinchZoomDistance = distance;
        justStartedPinchZoom = false;
    }

    function updateGesture() {
        if (pointerStates.size >= 2) {
            justStartedPinchZoom = true;
            currentGesture = GestureType.PinchZoom;
        } else if (pointerStates.size === 1) {
            currentGesture = GestureType.Pan;
        } else {
            currentGesture = GestureType.None;
        }
    }

    makeDragListener(
        (ev) => {
            if (currentGesture === GestureType.Pan) {
                processPan(ev);
            } else if (currentGesture === GestureType.PinchZoom) {
                processPinchZoom(ev);
            }
        },
        (ev) => {
            pointerStates.delete(ev.pointerId);
            updateGesture();
        },
        false,
    );

    return {
        beginGesture(ev: PointerEvent) {
            pointerStates.set(ev.pointerId, { x: ev.pageX, y: ev.pageY });
            updateGesture();
        },
    };
});

export type IEditorGesturesHandler = NonNullable<ReturnType<typeof useEditorGesturesHandler>>;

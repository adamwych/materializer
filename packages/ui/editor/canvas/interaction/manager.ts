import { createContextProvider } from "@solid-primitives/context";
import { useEditorCameraState } from "./camera";
import { useEditorSelectionManager } from "./selection";
import { useEditorGesturesHandler } from "./gestures";

export const [EditorInteractionManager, useEditorInteractionManager] = createContextProvider(() => {
    const cameraState = useEditorCameraState()!;
    const gesturesHandler = useEditorGesturesHandler()!;
    const selectionManager = useEditorSelectionManager()!;

    return {
        onPointerDown(ev: PointerEvent) {
            if (ev.pointerType === "mouse") {
                if (ev.button === 0) {
                    selectionManager.beginCanvasInteraction(ev);
                } else if (ev.button === 1) {
                    gesturesHandler.beginGesture(ev);
                }
            } else if (ev.pointerType === "touch") {
                gesturesHandler.beginGesture(ev);
            }
        },

        onPointerDownOnNode(ev: PointerEvent, nodeId: number) {
            if (ev.pointerType === "mouse" && ev.button === 1) {
                return;
            }

            ev.stopPropagation();
            selectionManager.beginNodeInteraction(ev, nodeId);
        },

        onWheel(ev: WheelEvent) {
            const isZoomingIn = ev.deltaY < 0;
            cameraState.zoomAtOrigin(ev.pageX - 340, ev.pageY - 36, isZoomingIn ? 1.2 : 1 / 1.2);
        },
    };
});

export type IEditorInteractionManager = NonNullable<ReturnType<typeof useEditorInteractionManager>>;

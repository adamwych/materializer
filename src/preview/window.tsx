import { useEditorRuntimeContext } from "../graph-editor/runtime-context.tsx";
import { createEffect } from "solid-js";

export default function UIMaterialPreviewWindow() {
    const runtimeContext = useEditorRuntimeContext();
    const previewOutputTexture = runtimeContext.getPreviewOutputTexture();
    let canvasElement: HTMLCanvasElement;

    function onWheel(ev: WheelEvent) {
        runtimeContext.getRenderingEngine().getPreviewCameraController().zoom +=
            ev.deltaY / 200;
        runtimeContext.schedulePreviewRender();
    }

    function onMouseDown() {
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    }

    function onMouseMove(ev: MouseEvent) {
        runtimeContext
            .getRenderingEngine()
            .getPreviewCameraController().rotationX += ev.movementX / 50.0;
        runtimeContext
            .getRenderingEngine()
            .getPreviewCameraController().rotationY += ev.movementY / 50.0;
        runtimeContext.schedulePreviewRender();
    }

    function onMouseUp() {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
    }

    createEffect(() => {
        if (!canvasElement) {
            console.error("Preview canvas element was not found.");
            return;
        }

        try {
            const texture = previewOutputTexture();
            if (texture) {
                const context = canvasElement.getContext("bitmaprenderer");
                context?.transferFromImageBitmap(texture);
            }
        } catch (exception) {
            console.error(exception);
        }
    });

    return (
        <canvas
            width={448}
            height={448}
            ref={(canvas) => {
                canvasElement = canvas;
            }}
            onMouseDown={onMouseDown}
            onWheel={onWheel}
        ></canvas>
    );
}

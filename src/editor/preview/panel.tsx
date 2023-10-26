import { createEffect } from "solid-js";
import { useRenderingEngine } from "../../renderer/engine.ts";

export default function MaterialPreviewPanel() {
    const renderingEngine = useRenderingEngine()!;
    let canvasElement: HTMLCanvasElement;

    function onWheel(ev: WheelEvent) {
        renderingEngine.previewCamera.zoom += ev.deltaY / 200;
        renderingEngine.renderPreview();
    }

    function onMouseDown() {
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    }

    function onMouseMove(ev: MouseEvent) {
        renderingEngine.previewCamera.rotationX += ev.movementX / 50.0;
        renderingEngine.previewCamera.rotationY += ev.movementY / 50.0;
        renderingEngine.renderPreview();
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
            const texture = renderingEngine.previewTexture();
            if (texture) {
                const context = canvasElement.getContext("bitmaprenderer");
                context?.transferFromImageBitmap(texture);
            }
        } catch (error) {
            console.error(error);
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

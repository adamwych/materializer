import { createEffect } from "solid-js";
import { useRenderingEngine } from "../../renderer/engine.ts";
import makeMouseMoveListener from "../../utils/makeMouseMoveListener.ts";

export default function MaterialPreviewPanel() {
    const renderingEngine = useRenderingEngine()!;
    let canvasElement: HTMLCanvasElement;

    function onWheel(ev: WheelEvent) {
        renderingEngine.previewCamera.zoom += ev.deltaY / 200;
        renderingEngine.renderPreview();
    }

    const onMouseDown = makeMouseMoveListener((ev) => {
        renderingEngine.previewCamera.rotationX += ev.movementX / 50.0;
        renderingEngine.previewCamera.rotationY += ev.movementY / 50.0;
        renderingEngine.renderPreview();
    });

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
        <div>
            <div class="px-4 py-2 text-sm flex items-center justify-between bg-gray-300-0 border-b border-gray-400-0 font-semibold uppercase text-gray-800-0">
                Preview
            </div>
            <canvas
                class="flex-shrink-0"
                width={400}
                height={400}
                ref={(canvas) => {
                    canvasElement = canvas;
                }}
                onMouseDown={onMouseDown}
                onWheel={onWheel}
            ></canvas>
        </div>
    );
}

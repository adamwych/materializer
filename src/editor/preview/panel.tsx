import { createEffect } from "solid-js";
import { useRenderingEngine } from "../../renderer/engine.ts";
import makeMouseMoveListener from "../../utils/makeMouseMoveListener.ts";
import PanelSection from "../../components/panel/section.tsx";

export default function MaterialPreviewPanel() {
    const renderingEngine = useRenderingEngine()!;
    let canvasElement: HTMLCanvasElement;

    function onWheel(ev: WheelEvent) {
        renderingEngine.previewCamera.zoom *= ev.deltaY > 0 ? 1.2 : 1 / 1.2;
        renderingEngine.renderPreview();
    }

    const onMouseDown = makeMouseMoveListener((ev) => {
        renderingEngine.previewCamera.rotationX += ev.movementX / 50.0;
        renderingEngine.previewCamera.rotationY -= ev.movementY / 50.0;
        renderingEngine.renderPreview();
    });

    createEffect(() => {
        if (!canvasElement) {
            console.error("Preview canvas element was not found.");
            return;
        }

        const texture = renderingEngine.previewTexture();
        try {
            if (texture) {
                const context = canvasElement.getContext("2d");
                context?.drawImage(texture, 0, 0, canvasElement.width, canvasElement.height);
            }
        } catch (error) {
            console.error(error);
        } finally {
            texture?.close();
        }
    });

    return (
        <PanelSection label="Preview">
            <canvas
                class="-m-4 flex-shrink-0"
                width={400}
                height={400}
                ref={(canvas) => {
                    canvasElement = canvas;
                }}
                onMouseDown={onMouseDown}
                onWheel={onWheel}
            ></canvas>
        </PanelSection>
    );
}

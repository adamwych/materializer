import { onMount } from "solid-js";
import { useRenderEngine } from "../../renderer/engine";
import makeDragListener from "../../utils/makeDragListener";
import { toRadians } from "../../utils/math";

export default function EditorEnvironmentPreviewPanel() {
    let rotationX = toRadians(225);
    let rotationY = toRadians(-135);
    let zoom = 4;
    const renderer = useRenderEngine()!;

    function initialize(canvas: HTMLCanvasElement) {
        renderer.setEnvironmentPreviewOutlet(canvas.transferControlToOffscreen());
    }

    function onPointerDown() {
        makeDragListener((ev) => {
            rotationX += ev.movementX / 50;
            rotationY -= ev.movementY / 50;
            renderer.setEnvironmentPreviewCameraTransform(rotationX, rotationY, zoom);
        });
    }

    function onWheel(ev: WheelEvent) {
        zoom *= ev.deltaY > 0 ? 1.2 : 1 / 1.2;
        renderer.setEnvironmentPreviewCameraTransform(rotationX, rotationY, zoom);
    }

    return (
        <div>
            <canvas
                ref={(e) => onMount(() => initialize(e))}
                class="w-full"
                width="340px"
                height="340px"
                onPointerDown={onPointerDown}
                onWheel={onWheel}
            />
        </div>
    );
}

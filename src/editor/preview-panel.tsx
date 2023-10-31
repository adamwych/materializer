import { useRenderingEngine } from "../renderer/engine.ts";
import makeMouseMoveListener from "../utils/makeMouseMoveListener.ts";
import PanelSection from "../components/panel/section.tsx";
import { onMount } from "solid-js";
import * as glMatrix from "gl-matrix";

export default function MaterialPreviewPanel() {
    const renderer = useRenderingEngine()!;
    let renderRequested = false;
    let canvasElement: HTMLCanvasElement;
    let rotationX = 0 * (Math.PI / 180);
    let rotationY = 0.01 * (Math.PI / 180);
    let zoom = 2;

    onMount(() => {
        renderer.initializeCanvas(canvasElement.transferControlToOffscreen());
        requestRender();
    });

    function requestRender() {
        if (!renderRequested) {
            renderRequested = true;
            requestAnimationFrame(() => {
                renderer.requestPreviewUpdate(buildViewProjectionMatrix());
                renderRequested = false;
            });
        }
    }

    const onMouseDown = makeMouseMoveListener((ev) => {
        rotationX += ev.movementX / 50.0;
        rotationY -= ev.movementY / 50.0;
        requestRender();
    });

    function onWheel(ev: WheelEvent) {
        zoom *= ev.deltaY > 0 ? 1.2 : 1 / 1.2;
        requestRender();
    }

    function buildViewProjectionMatrix() {
        const projection = glMatrix.mat4.perspective(
            glMatrix.mat4.create(),
            40.0 * (Math.PI / 180),
            400.0 / 400.0,
            0.01,
            1000,
        );

        const view = glMatrix.mat4.lookAt(
            glMatrix.mat4.create(),
            glMatrix.vec3.fromValues(
                zoom * Math.sin(-rotationX) * Math.sin(rotationY),
                zoom * Math.cos(rotationY),
                zoom * Math.cos(-rotationX) * Math.sin(rotationY),
            ),
            glMatrix.vec3.fromValues(0, 0, 0),
            glMatrix.vec3.fromValues(0, 1, 0),
        );

        return glMatrix.mat4.mul(glMatrix.mat4.create(), projection, view) as Float32Array;
    }

    return (
        <PanelSection label="Preview">
            <canvas
                ref={(e) => (canvasElement = e)}
                class="-m-4 flex-shrink-0"
                width={2048}
                height={2048}
                onMouseDown={onMouseDown}
                onWheel={onWheel}
                style={{ width: "400px", height: "400px" }}
            />
        </PanelSection>
    );
}

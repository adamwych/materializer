import { useRenderingEngine } from "../renderer/engine.ts";
import makeDeferredDragListener from "../utils/makeDeferredDragListener.ts";
import { onMount } from "solid-js";
import * as glMatrix from "gl-matrix";
import { useMaterialContext } from "./material-context.ts";
import { useRenderingScheduler } from "../renderer/scheduler.ts";

export default function MaterialPreviewCanvas() {
    const materialCtx = useMaterialContext()!;
    const renderer = useRenderingEngine()!;
    const scheduler = useRenderingScheduler()!;
    const width = 340;
    const height = 340;
    let renderRequested = false;
    let canvasElement: HTMLCanvasElement;
    let rotationX = 0 * (Math.PI / 180);
    let rotationY = 0.01 * (Math.PI / 180);
    let zoom = 2;

    onMount(() => {
        renderer.initializeCanvas(canvasElement.transferControlToOffscreen());
        materialCtx.getNodes().forEach(scheduler.scheduleChain);
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

    const onMouseDown = makeDeferredDragListener((ev) => {
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
            width / height,
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
        <canvas
            ref={(e) => (canvasElement = e)}
            class="-m-4 flex-shrink-0"
            width={Math.max(materialCtx.getOutputTextureWidth(), width)}
            height={Math.max(materialCtx.getOutputTextureWidth(), height)}
            onMouseDown={onMouseDown}
            onWheel={onWheel}
            style={{ width: width + "px", height: height + "px" }}
        />
    );
}

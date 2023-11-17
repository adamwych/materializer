import { createResizeObserver } from "@solid-primitives/resize-observer";
import { createEffect, createSignal, onMount } from "solid-js";
import { useRenderEngine } from "../../../renderer/engine";
import { WebGL2RenderWorker } from "../../../renderer/types";
import { useWorkspaceStore } from "../../../stores/workspace";
import FillLoader from "../../components/loader/fill-loader";
import { useEditorCameraState } from "./interaction/camera";

export default function EditorNodeThumbnailsCanvas() {
    const workspaceManager = useWorkspaceStore()!;
    const renderer = useRenderEngine()!;
    const cameraState = useEditorCameraState()!;
    const [waitingForPreviewCanvas, setWaitingForPreviewCanvas] = createSignal(true);
    let sizeElement!: HTMLDivElement;
    let worker: WebGL2RenderWorker;

    function initialize(canvasElement: HTMLCanvasElement) {
        const material = workspaceManager.getActiveMaterial()!;

        renderer.events.on("previewCanvasReady", () => setWaitingForPreviewCanvas(false));

        renderer
            .initializeWebGLWorker(canvasElement.transferControlToOffscreen(), material, true)
            .then((w) => {
                worker = w;
                worker.setEditorUITransform(
                    cameraState.smoothOffsetX(),
                    cameraState.smoothOffsetY(),
                    cameraState.smoothScale(),
                );
                worker.setEditorUIViewportSize(sizeElement.clientWidth, sizeElement.clientHeight);
            });

        createResizeObserver(sizeElement, ({ width, height }) => {
            worker?.setEditorUIViewportSize(width, height);
        });
    }

    createEffect(() => {
        const x = cameraState.smoothOffsetX();
        const y = cameraState.smoothOffsetY();
        const scale = cameraState.smoothScale();
        worker?.setEditorUITransform(x, y, scale);
    });

    return (
        <div>
            {/*
                Canvas does not support percentage width/height, so this div element
                is used to measure the width and height instead.
            */}
            <div ref={sizeElement} class="absolute w-full h-full" />

            {waitingForPreviewCanvas() && <FillLoader />}

            <canvas
                ref={(e) => onMount(() => initialize(e))}
                class="absolute z-10 pointer-events-none"
            />
        </div>
    );
}

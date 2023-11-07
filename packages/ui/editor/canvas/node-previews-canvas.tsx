import { createResizeObserver } from "@solid-primitives/resize-observer";
import { createEffect, onMount } from "solid-js";
import { useRenderEngine } from "../../../renderer/engine";
import { useWorkspaceStore } from "../../../stores/workspace";
import { useEditorCameraState } from "./interaction/camera";
import { WebGL2RenderWorker } from "../../../renderer/types";

export default function EditorNodePreviewsCanvas() {
    const workspaceManager = useWorkspaceStore()!;
    const renderEngine = useRenderEngine()!;
    const cameraState = useEditorCameraState()!;
    let sizeElement!: HTMLDivElement;
    let worker: WebGL2RenderWorker;

    function initialize(canvasElement: HTMLCanvasElement) {
        const material = workspaceManager.getActiveMaterial()!;

        worker = renderEngine.initializeWebGLWorker(
            canvasElement.transferControlToOffscreen(),
            material,
            true,
        );

        worker.setEditorUITransform(
            cameraState.smoothOffsetX(),
            cameraState.smoothOffsetY(),
            cameraState.smoothScale(),
        );

        createResizeObserver(sizeElement, ({ width, height }) => {
            worker.setEditorUIViewportSize(width, height);
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

            <canvas
                ref={(e) => onMount(() => initialize(e))}
                class="absolute z-10 pointer-events-none"
            />
        </div>
    );
}

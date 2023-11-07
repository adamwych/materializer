import { onMount } from "solid-js";
import { Material } from "../../../types/material";
import cn from "../../../utils/cn";
import { EDITOR_ELEMENT_ID } from "../consts";
import EditorCanvasBackground from "./background";
import EditorCanvasConnectionBuilderCurve from "./connection-builder-curve";
import EditorCanvasConnectionsOverlay from "./connections-overlay";
import EditorCanvasControls from "./controls";
import { useEditorCameraState } from "./interaction/camera";
import { useEditorInteractionManager } from "./interaction/manager";
import registerEditorCanvasShortcuts from "./interaction/shortcuts";
import EditorCanvasMultiselectRect from "./multiselect-rect";
import EditorNodePreviewsCanvas from "./node-previews-canvas";
import EditorCanvasNodes from "./nodes";

type Props = {
    material: Material;
    class?: string;
};

export default function EditorCanvas(props: Props) {
    const interactionManager = useEditorInteractionManager()!;
    const cameraState = useEditorCameraState()!;

    registerEditorCanvasShortcuts();

    return (
        <div
            id={EDITOR_ELEMENT_ID}
            ref={(e) => onMount(() => cameraState.setRootElement(e))}
            class={cn("relative w-full h-full overflow-hidden touch-none", props.class)}
            onPointerDown={interactionManager.onPointerDown}
            onWheel={interactionManager.onWheel}
        >
            <EditorNodePreviewsCanvas />
            <EditorCanvasMultiselectRect />
            <EditorCanvasControls />

            <div
                class="absolute origin-top-left"
                style={{ transform: cameraState.transformMatrixCss() }}
            >
                <EditorCanvasBackground />
                <EditorCanvasConnectionsOverlay />
            </div>

            <div
                class="absolute origin-top-left z-10"
                style={{ transform: cameraState.transformMatrixCss() }}
            >
                <EditorCanvasNodes />
                <EditorCanvasConnectionBuilderCurve />
            </div>
        </div>
    );
}
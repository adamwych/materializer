import {
    MinimalRenderableMaterialNodeSnapshot,
    RenderableMaterialNodeSnapshot,
    RenderableMaterialSnapshot,
} from "./types";

export type InitializeWorkerCommand = {
    command: "initialize";
    canvas: OffscreenCanvas;
    material: RenderableMaterialSnapshot;
};

export type SynchronizeNodeCommand = {
    command: "synchronizeNode";
    nodeId: number;
    nodeSnapshot: RenderableMaterialNodeSnapshot | MinimalRenderableMaterialNodeSnapshot | null;
};

export type SetEditorUIViewportSizeCommand = {
    command: "setEditorUIViewportSize";
    width: number;
    height: number;
};

export type SetEditorUITransformCommand = {
    command: "setEditorUITransform";
    x: number;
    y: number;
    scale: number;
};

export type SetEnvironmentPreviewOutletCommand = {
    command: "setEnvironmentPreviewOutlet";
    canvas: OffscreenCanvas;
};

export type SetEnvironmentPreviewCameraTransformCommand = {
    command: "setEnvironmentPreviewCameraTransform";
    rotationX: number;
    rotationY: number;
    zoom: number;
};

export type RenderWorkerCommand =
    | InitializeWorkerCommand
    | SynchronizeNodeCommand
    | SetEditorUIViewportSizeCommand
    | SetEditorUITransformCommand
    | SetEnvironmentPreviewOutletCommand
    | SetEnvironmentPreviewCameraTransformCommand;

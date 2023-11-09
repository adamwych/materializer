import { MaterialGraphEdge } from "../types/graph";
import TextureFilterMethod from "../types/texture-filter";
import { MinimalMaterialNodeSnapshot, MaterialNodeSnapshot, MaterialSnapshot } from "./types";

export type InitializeWorkerCommand = {
    command: "initialize";
    canvas: OffscreenCanvas;
    material: MaterialSnapshot;
    start: boolean;
};

export type SynchronizeNodeCommand = {
    command: "synchronizeNode";
    nodeId: number;
    nodeSnapshot: MaterialNodeSnapshot | MinimalMaterialNodeSnapshot | null;
};

export type SynchronizeEdgesCommand = {
    command: "synchronizeEdges";
    nodeId: number;
    edges: Array<MaterialGraphEdge>;
};

export type RenderNodeAndGetImageCommand = {
    command: "renderNodeAndGetImage";
    nodeId: number;
    outputWidth?: number;
    outputHeight?: number;
    outputFilterMethod?: TextureFilterMethod;
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

export type SetEnvironmentPreviewDestinationCommand = {
    command: "setEnvironmentPreviewDestination";
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
    | SynchronizeEdgesCommand
    | RenderNodeAndGetImageCommand
    | SetEditorUIViewportSizeCommand
    | SetEditorUITransformCommand
    | SetEnvironmentPreviewDestinationCommand
    | SetEnvironmentPreviewCameraTransformCommand;

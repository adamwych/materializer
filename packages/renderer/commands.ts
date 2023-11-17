import { MaterialGraphEdge } from "../material/graph";
import TextureFilterMethod from "../types/texture-filter";
import { PreviewMode } from "./preview";
import { Preview2dSettings } from "./preview-2d";
import { Preview3dSettings } from "./preview-3d";
import { MaterialNodeSnapshot, MaterialSnapshot, MinimalMaterialNodeSnapshot } from "./types";

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

export type SetPreviewCanvasCommand = {
    command: "setPreviewCanvas";
    canvas: OffscreenCanvas;
};

export type SetPreviewModeCommand = {
    command: "setPreviewMode";
    mode: PreviewMode;
};

export type Set3dPreviewSettingsCommand = {
    command: "set3dPreviewSettings";
    settings: Partial<Preview3dSettings>;
};

export type Set2dPreviewSettingsCommand = {
    command: "set2dPreviewSettings";
    settings: Partial<Preview2dSettings>;
};

export type RenderWorkerCommand =
    | InitializeWorkerCommand
    | SynchronizeNodeCommand
    | SynchronizeEdgesCommand
    | RenderNodeAndGetImageCommand
    | SetEditorUIViewportSizeCommand
    | SetEditorUITransformCommand
    | SetPreviewCanvasCommand
    | SetPreviewModeCommand
    | Set3dPreviewSettingsCommand
    | Set2dPreviewSettingsCommand;

export enum RenderWorkerResponse {
    OK = 0,
    WebGLContextNotAvailable = 1,
}

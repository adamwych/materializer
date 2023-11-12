import { MaterialGraphEdge } from "../material/graph";
import TextureFilterMethod from "../types/texture-filter";
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

export type Set3dPreviewCanvasCommand = {
    command: "set3dPreviewCanvas";
    canvas: OffscreenCanvas;
};

export type Set3dPreviewSettingsCommand = {
    command: "set3dPreviewSettings";
    settings: Partial<Preview3dSettings>;
};

export type RenderWorkerCommand =
    | InitializeWorkerCommand
    | SynchronizeNodeCommand
    | SynchronizeEdgesCommand
    | RenderNodeAndGetImageCommand
    | SetEditorUIViewportSizeCommand
    | SetEditorUITransformCommand
    | Set3dPreviewCanvasCommand
    | Set3dPreviewSettingsCommand;

export enum RenderWorkerResponse {
    OK = 0,
    WebGLContextNotAvailable = 1,
}

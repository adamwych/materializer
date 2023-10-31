import { Material } from "../../types/material";

export type RenderWorkerSetPreviewCanvasMessage = {
    type: RenderWorkerMessageType.InitializeCanvas;
    canvas: OffscreenCanvas;
};

export type RenderWorkerRenderMessage = {
    type: RenderWorkerMessageType.Render;
    material: Material;
    nodeIds: Array<number>;
    previewViewProjection: Float32Array;
};

export type RenderWorkerNodeRemovedMessage = {
    type: RenderWorkerMessageType.NodeRemoved;
    nodeId: number;
    outputIds: Array<string>;
};

export type RenderWorkerSetPreviewCameraMessage = {
    type: RenderWorkerMessageType.SetPreviewCamera;
    viewProjection: Float32Array;
};

export type RenderWorkerMessage =
    | RenderWorkerRenderMessage
    | RenderWorkerNodeRemovedMessage
    | RenderWorkerSetPreviewCanvasMessage
    | RenderWorkerSetPreviewCameraMessage;

export enum RenderWorkerMessageType {
    InitializeCanvas,
    Render,
    NodeRemoved,
    SetPreviewCamera,
}

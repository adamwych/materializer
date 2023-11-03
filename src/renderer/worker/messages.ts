import { Material } from "../../types/material";

export type RenderWorkerSetPreviewCanvasMessage = {
    type: RenderWorkerMessageType.InitializeCanvas;
    canvas: OffscreenCanvas;
};

export type RenderWorkerRenderNodesMessage = {
    type: RenderWorkerMessageType.RenderNodes;
    material: Material;
    nodeIds: Array<number>;
    textureWidth: number;
    textureHeight: number;
    outputBitmapWidth: number;
    outputBitmapHeight: number;
};

export type RenderWorkerRenderChunkMessage = {
    type: RenderWorkerMessageType.RenderChunk;
    bitmaps: Map<string, ImageBitmap>;
};

export type RenderWorkerRenderFinishedMessage = {
    type: RenderWorkerMessageType.RenderFinished;
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

export type IncomingRenderWorkerMessage =
    | RenderWorkerRenderNodesMessage
    | RenderWorkerNodeRemovedMessage
    | RenderWorkerSetPreviewCanvasMessage
    | RenderWorkerSetPreviewCameraMessage;

export type OutgoingRenderWorkerMessage =
    | RenderWorkerRenderChunkMessage
    | RenderWorkerRenderFinishedMessage;

export enum RenderWorkerMessageType {
    InitializeCanvas,
    RenderNodes,
    RenderFinished,
    RenderChunk,
    NodeRemoved,
    SetPreviewCamera,
}

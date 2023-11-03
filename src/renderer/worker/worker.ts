import { Material } from "../../types/material";
import {
    RenderWorkerMessage,
    RenderWorkerMessageType,
    RenderWorkerNodeRemovedMessage,
    RenderWorkerRenderMessage,
    RenderWorkerSetPreviewCameraMessage,
    RenderWorkerSetPreviewCanvasMessage,
} from "./messages";
import { clearNodeCache, initializeNodeRendererResources, renderNode } from "./render-node";
import { initializePreviewRendererResources, renderPreview } from "./render-preview";

const textures = new Map<string, WebGLTexture>();
let gl: WebGL2RenderingContext;
let lastRenderedMaterial: Material;
let lastPreviewViewProjection = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

function handleInitializeCanvasMessage(message: RenderWorkerSetPreviewCanvasMessage) {
    gl = message.canvas.getContext("webgl2", {
        antialias: false,
    })!;

    initializeNodeRendererResources(message.canvas);
    initializePreviewRendererResources(message.canvas, gl);
}

function handleRenderMessage(message: RenderWorkerRenderMessage) {
    const bitmaps = new Map<string, ImageBitmap>();

    for (const nodeId of message.nodeIds) {
        const node = message.material.nodes.find((x) => x.id === nodeId);
        if (node) {
            renderNode(
                gl,
                message.material,
                node,
                textures,
                bitmaps,
                message.textureWidth,
                message.textureHeight,
                message.outputBitmapWidth,
                message.outputBitmapHeight,
            );
        }
    }

    renderPreview(gl, textures, message.material, lastPreviewViewProjection);

    lastRenderedMaterial = message.material;

    self.postMessage(bitmaps, {
        transfer: Array.from(bitmaps.values()),
    });
}

function handleNodeRemovedMessage(message: RenderWorkerNodeRemovedMessage) {
    const { nodeId, outputIds } = message;
    clearNodeCache(nodeId);
    outputIds.forEach((outputId) => {
        textures.delete(`${nodeId}-${outputId}`);
    });
}

function handleSetPreviewCameraMessage(message: RenderWorkerSetPreviewCameraMessage) {
    lastPreviewViewProjection = message.viewProjection;
    if (lastRenderedMaterial) {
        renderPreview(gl, textures, lastRenderedMaterial, lastPreviewViewProjection);
    }
}

self.onmessage = (msg: MessageEvent<RenderWorkerMessage>) => {
    const handler = {
        [RenderWorkerMessageType.InitializeCanvas]: handleInitializeCanvasMessage,
        [RenderWorkerMessageType.Render]: handleRenderMessage,
        [RenderWorkerMessageType.NodeRemoved]: handleNodeRemovedMessage,
        [RenderWorkerMessageType.SetPreviewCamera]: handleSetPreviewCameraMessage,
    }[msg.data?.type];

    if (handler) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler(msg.data as any);
    } else {
        console.warn(`Render worker received a message of unsupported type: ${msg.data?.type}`);
    }
};

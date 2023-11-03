import { createContextProvider } from "@solid-primitives/context";
import { ReactiveMap } from "@solid-primitives/map";
import { useMaterialContext } from "../editor/material-context";
import { RenderWorkerMessageType, RenderWorkerRenderMessage } from "./worker/messages";
import RenderWorkerImpl from "./worker/worker?worker";
import { EDITOR_THUMBNAIL_HEIGHT, EDITOR_THUMBNAIL_WIDTH } from "../editor/constants";

type NodeBitmapStorageEntry = {
    bitmap?: ImageBitmap;
};

export const [RenderingEngineProvider, useRenderingEngine] = createContextProvider(() => {
    const materialCtx = useMaterialContext()!;
    const bitmaps = new ReactiveMap<string, NodeBitmapStorageEntry>();
    let [outputWidth, outputHeight] = [EDITOR_THUMBNAIL_WIDTH, EDITOR_THUMBNAIL_HEIGHT];
    let [nodeTextureWidth, nodeTextureHeight] = [32, 32];
    let worker: Worker;

    materialCtx.events.on("removed", (node) => {
        worker.postMessage({
            type: RenderWorkerMessageType.NodeRemoved,
            nodeId: node.id,
            outputIds: node.spec?.outputSockets.map((x) => x.id),
        });

        node.spec?.outputSockets.forEach((output) => {
            bitmaps.delete(`${node.id}-${output.id}`);
        });
    });

    return {
        initializeCanvas(canvas: OffscreenCanvas) {
            if (worker) {
                worker.terminate();
            }

            worker = new RenderWorkerImpl();
            worker.postMessage(
                {
                    type: RenderWorkerMessageType.InitializeCanvas,
                    canvas,
                },
                {
                    transfer: [canvas],
                },
            );
        },

        requestNodesUpdate(ids: Array<number>) {
            return new Promise<void>((resolve) => {
                worker.onmessage = (msg) => {
                    for (const [k, v] of msg.data.entries()) {
                        bitmaps.set(k, { bitmap: v });
                    }

                    resolve();
                };

                const message: RenderWorkerRenderMessage = {
                    type: RenderWorkerMessageType.Render,
                    material: materialCtx.getMaterial(),
                    nodeIds: ids,
                    textureWidth: nodeTextureWidth,
                    textureHeight: nodeTextureHeight,
                    outputBitmapWidth: outputWidth,
                    outputBitmapHeight: outputHeight,
                };

                worker.postMessage(message);
            });
        },

        requestPreviewUpdate(viewProjection: Float32Array) {
            worker.postMessage({
                type: RenderWorkerMessageType.SetPreviewCamera,
                viewProjection,
            });
        },

        setNodeTextureSize(width: number, height: number) {
            nodeTextureWidth = width;
            nodeTextureHeight = height;
        },

        setOutputTextureSize(width: number, height: number) {
            outputWidth = width;
            outputHeight = height;
        },

        getNodeBitmap(nodeId: number, socketId: string) {
            const key = `${nodeId}-${socketId}`;
            if (!bitmaps.has(key)) {
                bitmaps.set(key, {
                    bitmap: undefined,
                });
            }
            return () => bitmaps.get(key);
        },
    };
});

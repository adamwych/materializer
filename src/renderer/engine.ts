import { createContextProvider } from "@solid-primitives/context";
import { ReactiveMap } from "@solid-primitives/map";
import { useMaterialContext } from "../editor/material-context";
import { RenderWorkerMessageType } from "./worker/messages";
import RenderWorkerImpl from "./worker/worker?worker";

type NodeBitmapStorageEntry = {
    bitmap?: ImageBitmap;
};

export const [RenderingEngineProvider, useRenderingEngine] = createContextProvider(() => {
    const materialCtx = useMaterialContext()!;
    const bitmaps = new ReactiveMap<string, NodeBitmapStorageEntry>();
    const worker = new RenderWorkerImpl();

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

                worker.postMessage({
                    type: RenderWorkerMessageType.Render,
                    material: materialCtx.getMaterial(),
                    nodeIds: ids,
                });
            });
        },

        requestPreviewUpdate(viewProjection: Float32Array) {
            worker.postMessage({
                type: RenderWorkerMessageType.SetPreviewCamera,
                viewProjection,
            });
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

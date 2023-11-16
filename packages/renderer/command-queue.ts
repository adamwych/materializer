import { RenderWorkerCommand, RenderWorkerResponse } from "./commands";
import { RenderWorker } from "./engine";

type RenderWorkerResponseHandler = (response?: RenderWorkerResponse) => void;

type RenderCommandQueueEntry = {
    command: RenderWorkerCommand;
    transfer: Array<Transferable>;
    responseHandler?: RenderWorkerResponseHandler;
};

export default function createRenderCommandQueue(worker: RenderWorker) {
    let queue = new Array<RenderCommandQueueEntry>();
    let waitingForResponse = false;

    function processQueue() {
        if (waitingForResponse || queue.length === 0) {
            return;
        }

        waitingForResponse = true;

        const entry = queue.shift()!;
        if (entry.responseHandler) {
            worker.onmessage = (ev: MessageEvent<RenderWorkerResponse>) => {
                entry.responseHandler?.(ev.data);

                waitingForResponse = false;
                processQueue();
            };

            worker.postMessage(entry.command, entry.transfer);
        } else {
            worker.onmessage = null;
            worker.postMessage(entry.command, entry.transfer);

            waitingForResponse = false;
            processQueue();
        }
    }

    return {
        enqueue(
            command: RenderWorkerCommand,
            transfer: Array<Transferable> = [],
            responseHandler?: RenderWorkerResponseHandler,
        ) {
            queue.push({ command, transfer, responseHandler });
            processQueue();
        },

        enqueueAndWaitForResponse(
            command: RenderWorkerCommand,
            transfer: Array<Transferable> = [],
        ) {
            return new Promise((resolve) => {
                this.enqueue(command, transfer, resolve);
            });
        },

        clear() {
            queue = [];
        },
    };
}

export type RenderCommandQueue = NonNullable<ReturnType<typeof createRenderCommandQueue>>;

import { createContextProvider } from "@solid-primitives/context";
import createRAF from "@solid-primitives/raf";
import { useMaterialContext } from "../editor/material-context";
import { MaterialNode } from "../types/material";
import { useRenderingEngine } from "./engine";

/**
 * Scheduler is responsible for preparing a list of jobs for the rendering engine to do.
 *
 * Jobs can be scheduled at any time, but they are ran in a fixed timeframe to prevent
 * freezing the UI if there's a lot of work to do at once and to detect unnecessary
 * back-to-back re-renders. In the future it should also contain logic to split the work
 * into multiple animation frames to further prevent freezing.
 */
export const [RenderingSchedulerProvider, useRenderingScheduler] = createContextProvider(
    ({ value }: { value?: boolean }) => {
        const autoStart = value;
        const materialCtx = useMaterialContext()!;
        const engine = useRenderingEngine()!;

        let queue: Array<number> = [];
        let isRendering = false;

        const [_, start, __] = createRAF(() => {
            runOnce();
        });

        async function runOnce() {
            if (isRendering) {
                return Promise.resolve();
            }

            if (queue.length > 0) {
                const ids = [...queue];
                isRendering = true;
                queue = [];

                await engine.requestNodesUpdate(ids);

                isRendering = false;
            }

            return Promise.resolve();
        }

        /**
         * Schedules a new rendering job for given node.
         *
         * Note that this will only render this exact node, it will not schedule
         * re-renders for inputs of this node, so the result might be outdated if
         * for example parameters of this node's inputs have changed since the last
         * time they were rendered.
         *
         * To also re-render the inputs use `scheduleChain` instead.
         *
         * @param node
         */
        function schedule(node: MaterialNode) {
            // Prevent scheduling multiple render jobs for the same node.
            if (isNodeQueued(node)) {
                return;
            }

            queue.push(node.id);
        }

        /**
         * Evaluates inputs and outputs of given node and schedules rendering
         * jobs for all of them.
         *
         * To only render a specific node use `schedule` instead.
         *
         * @param node
         */
        function scheduleChain(node: MaterialNode) {
            // Prevent scheduling multiple render jobs for the same node.
            if (isNodeQueued(node)) {
                return;
            }

            // Recursively schedule re-renders of inputs.
            materialCtx
                .getSocketConnections()
                .filter((connection) => connection.to.nodeId === node.id)
                .map((connection) => materialCtx.getNodeById(connection.from.nodeId)!)
                .forEach((node) => scheduleChain(node));

            schedule(node);

            // Recursively schedule re-renders of outputs.
            materialCtx
                .getSocketConnections()
                .filter((connection) => connection.from.nodeId === node.id)
                .map((connection) => materialCtx.getNodeById(connection.to.nodeId)!)
                .forEach((node) => scheduleChain(node));
        }

        function isNodeQueued(node: MaterialNode) {
            return queue.some((nodeId) => nodeId === node.id);
        }

        // Listen to changes. Internally, material is kept as a store
        // so we need to use events to communicate when a change was made.
        materialCtx.events.on("added", scheduleChain);
        materialCtx.events.on("changed", scheduleChain);

        if (autoStart) {
            start();
        }

        return {
            runOnce,
            schedule,
            scheduleChain,
        };
    },
);

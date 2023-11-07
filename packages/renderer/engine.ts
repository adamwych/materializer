import { createContextProvider } from "@solid-primitives/context";
import { onCleanup } from "solid-js";
import { unwrap } from "solid-js/store";
import { useNodeBlueprintsStore } from "../stores/blueprints";
import { useMaterialStore } from "../stores/material";
import { Material } from "../types/material";
import { MaterialNodeEvent } from "../types/material-events";
import { MaterialNode } from "../types/node";
import { RenderWorkerCommand } from "./commands";
import {
    MinimalRenderableMaterialNodeSnapshot,
    RenderableMaterialNodeSnapshot,
    WebGL2RenderWorker,
} from "./types";
import WebGL2RenderWorkerImpl from "./webgl2/worker?worker";

// A re-type of `Worker`, because the original doesn't support specifying message type...
interface RenderWorker extends Omit<Worker, "postMessage"> {
    postMessage(command: RenderWorkerCommand): void;
    postMessage(command: RenderWorkerCommand, transfer: Transferable[]): void;
    postMessage(command: RenderWorkerCommand, options?: StructuredSerializeOptions): void;
}

export const [RenderEngineProvider, useRenderEngine] = createContextProvider(() => {
    const materialStore = useMaterialStore()!;
    const blueprintStore = useNodeBlueprintsStore()!;
    let worker: RenderWorker | undefined;

    // Listen to changes in the material and send updates to the worker.
    const materialEvents = materialStore.getEvents();
    materialEvents.on("nodeAdded", (ev) => synchronizeNode(ev, true, false));
    materialEvents.on("nodeParameterChanged", synchronizeNode);
    materialEvents.on("nodeConnectionsChanged", synchronizeNode);
    materialEvents.on("nodeMoved", synchronizeNode);
    materialEvents.on("nodeRemoved", (ev) => synchronizeNode(ev, false));

    onCleanup(() => {
        worker?.terminate();
    });

    function createMinimalNodeSnapshot(node: MaterialNode): MinimalRenderableMaterialNodeSnapshot {
        return {
            node: unwrap(node),
            inputs: materialStore.getInputsMap(node),
            outputs: materialStore.getOutputsMap(node),
        };
    }

    function createNodeSnapshot(node: MaterialNode): RenderableMaterialNodeSnapshot {
        return {
            ...createMinimalNodeSnapshot(node),
            blueprint: blueprintStore.getBlueprintByPath(node.path)!,
        };
    }

    function synchronizeNode(ev: MaterialNodeEvent, exists = true, update = true) {
        worker?.postMessage({
            command: "synchronizeNode",
            nodeId: ev.node.id,
            nodeSnapshot: exists
                ? update
                    ? createMinimalNodeSnapshot(ev.node)
                    : createNodeSnapshot(ev.node)
                : null,
        });
    }

    return {
        /**
         * Spawns a WebGL2 render worker and initializes it.
         * If another worker is currently running, it will be terminated.
         *
         * WebGL does not allow to share resources (e.g. textures) between
         * contexts and it is currently not possible to share the entire context
         * between multiple `canvas` elements. Because of this, part of editor's
         * UI which would require access to those resources is implemented directly
         * in the worker and is rendered using WebGL.
         *
         * @param canvas Canvas to which the worker will render UI elements.
         * @param material
         */
        initializeWebGLWorker(canvas: OffscreenCanvas, material: Material): WebGL2RenderWorker {
            worker?.terminate();

            worker = new WebGL2RenderWorkerImpl();
            worker.postMessage(
                {
                    command: "initialize",
                    canvas,
                    material: {
                        nodes: Object.values(material.nodes).map(createNodeSnapshot),
                    },
                },
                [canvas],
            );

            return {
                setEditorUITransform(x, y, scale) {
                    worker?.postMessage({
                        command: "setEditorUITransform",
                        x,
                        y,
                        scale,
                    });
                },

                setEditorUIViewportSize(width, height) {
                    worker?.postMessage({
                        command: "setEditorUIViewportSize",
                        width,
                        height,
                    });
                },
            };
        },

        setEnvironmentPreviewOutlet(canvas: OffscreenCanvas) {
            worker?.postMessage(
                {
                    command: "setEnvironmentPreviewOutlet",
                    canvas,
                },
                [canvas],
            );
        },

        setEnvironmentPreviewCameraTransform(rotationX: number, rotationY: number, zoom: number) {
            worker?.postMessage({
                command: "setEnvironmentPreviewCameraTransform",
                rotationX,
                rotationY,
                zoom,
            });
        },
    };
});

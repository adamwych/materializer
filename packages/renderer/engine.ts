import { createContextProvider } from "@solid-primitives/context";
import { onCleanup } from "solid-js";
import { unwrap } from "solid-js/store";
import { Material } from "../material/material";
import { MaterialNodeEvent } from "../material/material-events";
import { MaterialNode } from "../material/node";
import { useNodeBlueprintsStore } from "../stores/blueprints";
import { useMaterialStore } from "../stores/material";
import TextureFilterMethod from "../types/texture-filter";
import { mapDictionary as mapMap } from "../utils/map";
import { RenderWorkerCommand, RenderWorkerResponse } from "./commands";
import { Preview3dSettings } from "./preview-3d";
import { MaterialNodeSnapshot, MinimalMaterialNodeSnapshot, WebGL2RenderWorker } from "./types";
import WebGL2RenderWorkerImpl from "./webgl2/worker?worker";
import createRenderCommandQueue, { RenderCommandQueue } from "./command-queue";

// A re-type of `Worker`, because the original doesn't support specifying message type...
export interface RenderWorker extends Omit<Worker, "postMessage"> {
    postMessage(command: RenderWorkerCommand): void;
    postMessage(command: RenderWorkerCommand, transfer: Transferable[]): void;
    postMessage(command: RenderWorkerCommand, options?: StructuredSerializeOptions): void;
}

/**
 * The primary purpose of this context is to manage the lifecycle of a render worker and
 * expose a communication interface between the worker and the UI application.
 *
 * Rendering is done by a dedicated worker to which the engine sends commands defined
 * in {@link RenderWorkerCommand}. Some commands send replies, but most are one-way.
 *
 * All changes made to the material through {@link MaterialStore} are tracked by the
 * engine and synchronized with the worker by sending a snapshot of current state of
 * the node that was modified. Once the worker receives an update, it will schedule
 * a re-render of the modified node and its entire chain.
 */
export const [RenderEngineProvider, useRenderEngine] = createContextProvider(() => {
    const materialStore = useMaterialStore()!;
    const blueprintStore = useNodeBlueprintsStore()!;
    let worker: RenderWorker | undefined;
    let commandQueue: RenderCommandQueue | undefined;

    function createMinimalNodeSnapshot(node: MaterialNode): MinimalMaterialNodeSnapshot {
        return {
            node: unwrap(node),
        };
    }

    function createNodeSnapshot(node: MaterialNode): MaterialNodeSnapshot {
        return {
            node: unwrap(node),
            blueprint: blueprintStore.getBlueprintByPath(node.path)!,
        };
    }

    function onNodeAdded(ev: MaterialNodeEvent) {
        commandQueue?.enqueue({
            command: "synchronizeNode",
            nodeId: ev.node.id,
            nodeSnapshot: createNodeSnapshot(ev.node),
        });
    }

    function onNodeRemoved(ev: MaterialNodeEvent) {
        commandQueue?.enqueue({
            command: "synchronizeNode",
            nodeId: ev.node.id,
            nodeSnapshot: null,
        });
    }

    function onNodeChanged(ev: MaterialNodeEvent) {
        commandQueue?.enqueue({
            command: "synchronizeNode",
            nodeId: ev.node.id,
            nodeSnapshot: createMinimalNodeSnapshot(ev.node),
        });
    }

    function onEdgesChanged(ev: MaterialNodeEvent) {
        commandQueue?.enqueue({
            command: "synchronizeEdges",
            nodeId: ev.node.id,
            edges: unwrap(materialStore.getMaterial().edges),
        });
    }

    // Listen to changes in the material and send updates to the worker.
    const materialEvents = materialStore.getEvents();
    materialEvents.on("nodeAdded", onNodeAdded);
    materialEvents.on("nodeRemoved", onNodeRemoved);
    materialEvents.on("nodeParameterChanged", onNodeChanged);
    materialEvents.on("nodeConnectionsChanged", onEdgesChanged);
    materialEvents.on("nodeMoved", onNodeChanged);

    onCleanup(() => {
        worker?.terminate();
    });

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
         * Returns a {@link WebGL2RenderWorker} object which can be used to send
         * commands specific to this kind of worker.
         *
         * @param canvas Canvas onto which the worker will render UI elements.
         * @param material Material that will be rendered.
         * @param runScheduler Whether worker should start its render job scheduler.
         */
        async initializeWebGLWorker(
            canvas: OffscreenCanvas,
            material: Material,
            runScheduler: boolean,
        ): Promise<WebGL2RenderWorker> {
            worker?.terminate();
            commandQueue?.clear();

            worker = new WebGL2RenderWorkerImpl();
            commandQueue = createRenderCommandQueue(worker);

            const response = await commandQueue?.enqueueAndWaitForResponse(
                {
                    command: "initialize",
                    canvas,
                    material: {
                        nodes: mapMap(material.nodes, createNodeSnapshot),
                        edges: unwrap(material.edges),
                    },
                    start: runScheduler,
                },
                [canvas],
            );

            if (response === RenderWorkerResponse.WebGLContextNotAvailable) {
                alert(
                    `
                    It looks like your browser does not support WebGL2, which is required to run Materializer.\n\n
                    If you're on Mac/iPhone/iPad, please update your system to Sonoma/17+.
                `.trim(),
                );

                worker?.terminate();
                worker = undefined;
            }

            return {
                setEditorUITransform(x, y, scale) {
                    commandQueue?.enqueue({
                        command: "setEditorUITransform",
                        x,
                        y,
                        scale,
                    });
                },

                setEditorUIViewportSize(width, height) {
                    commandQueue?.enqueue({
                        command: "setEditorUIViewportSize",
                        width,
                        height,
                    });
                },
            };
        },

        /**
         * Terminates currently running render worker.
         */
        terminateWorker() {
            worker?.terminate();
        },

        /**
         * Renders node by given ID and returns its image data.
         * To do this, worker will have to copy raw bitmap data from GPU to CPU,
         * so this operation will be slow for nodes that output large textures.
         *
         * @param nodeId ID of the node to render.
         * @param outputWidth Width of the output image. Defaults to node's texture size.
         * @param outputHeight Height of the output image. Defaults to node's texture size.
         * @param outputFilterMethod Filter method of the output image. Matters only if resizing.
         */
        renderAndGetImage(
            nodeId: number,
            outputWidth?: number,
            outputHeight?: number,
            outputFilterMethod?: TextureFilterMethod,
        ): Promise<ImageData> {
            return new Promise((resolve) => {
                if (!worker) {
                    throw "A worker must first be started before retriving node bitmap.";
                }

                worker.onmessage = (ev) => {
                    resolve(ev.data);
                };

                worker.postMessage({
                    command: "renderNodeAndGetImage",
                    nodeId,
                    outputWidth,
                    outputHeight,
                    outputFilterMethod,
                });
            });
        },

        /**
         * Sets the canvas to which 3D preview will be rendered.
         *
         * @param canvas
         */
        async set3dPreviewCanvas(canvas: OffscreenCanvas) {
            await commandQueue?.enqueueAndWaitForResponse(
                {
                    command: "set3dPreviewCanvas",
                    canvas,
                },
                [canvas],
            );
        },

        async update3dPreviewSettings(settings: Partial<Preview3dSettings>) {
            await commandQueue?.enqueueAndWaitForResponse({
                command: "set3dPreviewSettings",
                settings,
            });
        },

        update3dPreviewSettingsImmediate(settings: Partial<Preview3dSettings>) {
            commandQueue?.enqueue({
                command: "set3dPreviewSettings",
                settings,
            });
        },
    };
});

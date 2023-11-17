import { RenderWorkerCommand, RenderWorkerResponse } from "../commands";
import { PreviewMode } from "../preview";
import RenderJobScheduler from "../scheduler";
import { MaterialSnapshot } from "../types";
import WebGL2dPreviewRenderer from "./2d-preview/renderer";
import WebGL3dPreviewRenderer from "./3d-preview/renderer";
import WebGLEditorUIRenderer from "./editor-ui-renderer";
import WebGLNodeRenderer from "./node-renderer";
import IWebGLPreviewRenderer from "./preview-renderer";

/**
 * Currently the only available render worker uses WebGL2, which unfortunately does
 * not support sharing its context between multiple canvases, so some hacks had to be
 * used in order to ensure smooth workflow.
 *
 * The primary canvas that WebGL worker uses is an {@link OffscreenCanvas} attached to
 * a real canvas positioned above the graph editor. This allows us to very quickly draw
 * node thumbnails. The biggest drawback of this approach is that a clearly visible
 * ghosting can be seen when moving nodes, because most of the time the canvas will
 * be updated after the browser has already re-painted the page.
 *
 * Environmental preview is rendered by the same context, but after rendering it is
 * then read into a CPU-bound buffer and only then painted onto the final canvas.
 */

let canvas: OffscreenCanvas;
let gl: WebGL2RenderingContext;
let material: MaterialSnapshot;
let nodeRenderer: WebGLNodeRenderer;
let editorUIRenderer: WebGLEditorUIRenderer;
let preview3dRenderer: WebGL3dPreviewRenderer;
let preview2dRenderer: WebGL2dPreviewRenderer;
let previewRenderer: IWebGLPreviewRenderer;
let jobScheduler: RenderJobScheduler;

function renderQueuedNodes(nodeIds: Array<number>) {
    nodeIds.forEach((id) => {
        const node = material.nodes.get(id);
        if (node) {
            nodeRenderer.render(material, node);
        }
    });

    editorUIRenderer.render(material);
    previewRenderer?.render(material);
}

self.onmessage = async (ev: MessageEvent<RenderWorkerCommand>) => {
    switch (ev.data.command) {
        case "initialize": {
            material = ev.data.material;
            canvas = ev.data.canvas;

            const context = canvas.getContext("webgl2", {
                antialias: false,
            });
            if (!context) {
                self.postMessage(RenderWorkerResponse.WebGLContextNotAvailable);
                return;
            }

            gl = context;
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);

            // Float textures are required to create cubemaps.
            if (!gl.getExtension("EXT_color_buffer_float")) {
                self.postMessage(RenderWorkerResponse.WebGLContextNotAvailable);
                return;
            }

            nodeRenderer = new WebGLNodeRenderer(canvas, gl);
            editorUIRenderer = new WebGLEditorUIRenderer(canvas, gl, nodeRenderer);

            jobScheduler = new RenderJobScheduler(material);

            if (ev.data.start) {
                jobScheduler.start(renderQueuedNodes);
            }

            self.postMessage(RenderWorkerResponse.OK);
            break;
        }

        case "synchronizeNode": {
            // If the command contains a snapshot then the node was either just added to
            // the material or modified.
            if (ev.data.nodeSnapshot) {
                const node = material.nodes.get(ev.data.nodeId);

                // If that node already exists inside worker's copy of the material
                // then we just need to update it and schedule a re-render of itself
                // and its outputs (recursively).
                if (node) {
                    const didChangeTextureParams =
                        node.node.textureSize !== ev.data.nodeSnapshot.node.textureSize ||
                        node.node.textureFilterMethod !==
                            ev.data.nodeSnapshot.node.textureFilterMethod;
                    const justMoved =
                        node.node.x !== ev.data.nodeSnapshot.node.x ||
                        node.node.y !== ev.data.nodeSnapshot.node.y;

                    node.node = ev.data.nodeSnapshot.node;

                    // Don't re-render the node if all we did was change its position.
                    // Because of this it won't re-render if we change some parameter
                    // and position in a single call, but that doesn't ever happen.
                    if (justMoved) {
                        // If we don't schedule any render job for this node then
                        // the preview will not update, so we must update it manually.
                        editorUIRenderer.clearNodeTransformCache(ev.data.nodeId);
                        editorUIRenderer.render(material);
                    } else {
                        if (didChangeTextureParams) {
                            nodeRenderer.clearNodeCache(ev.data.nodeId);
                        }

                        jobScheduler.scheduleOutputs(ev.data.nodeId);
                    }
                } else {
                    if ("blueprint" in ev.data.nodeSnapshot) {
                        material.nodes.set(ev.data.nodeId, ev.data.nodeSnapshot);
                    } else {
                        console.error(
                            "Error: UI <-> Worker desync: Received update of a node that does not exist.",
                        );
                        return;
                    }

                    jobScheduler.scheduleChain(ev.data.nodeId);
                }
            } else {
                const { nodeId } = ev.data;

                nodeRenderer.clearNodeCache(nodeId);
                editorUIRenderer.clearNodeTransformCache(nodeId);

                jobScheduler.scheduleOutputs(nodeId);

                material.nodes.delete(nodeId);
                material.edges = material.edges.filter(
                    (edge) => edge.from[0] !== nodeId && edge.to[0] !== nodeId,
                );

                requestAnimationFrame(() => {
                    editorUIRenderer.render(material);
                });
            }

            break;
        }

        case "synchronizeEdges": {
            jobScheduler.scheduleOutputs(ev.data.nodeId);
            material.edges = ev.data.edges;
            jobScheduler.scheduleOutputs(ev.data.nodeId);
            break;
        }

        case "renderNodeAndGetImage": {
            const {
                nodeId: requestedNodeId,
                outputWidth,
                outputHeight,
                outputFilterMethod,
            } = ev.data;

            const tempScheduler = new RenderJobScheduler(material);
            tempScheduler.scheduleChain(ev.data.nodeId);
            tempScheduler.runOnce((ids) => {
                for (const nodeId of ids) {
                    const node = material.nodes.get(nodeId);
                    if (node) {
                        if (nodeId === requestedNodeId) {
                            const imageData = nodeRenderer.renderToImageData(
                                material,
                                node,
                                outputWidth,
                                outputHeight,
                                outputFilterMethod,
                            );
                            self.postMessage(imageData, { transfer: [imageData.data.buffer] });
                            break;
                        } else {
                            nodeRenderer.render(material, node);
                        }
                    }
                }
            });
            break;
        }

        case "setEditorUIViewportSize": {
            canvas.width = ev.data.width;
            canvas.height = ev.data.height;
            editorUIRenderer.updateCameraMatrix();

            requestAnimationFrame(() => {
                editorUIRenderer.render(material);
            });

            break;
        }

        case "setEditorUITransform": {
            editorUIRenderer.updateCamera(ev.data.x, ev.data.y, ev.data.scale);

            requestAnimationFrame(() => {
                editorUIRenderer.render(material);
            });

            break;
        }

        case "setPreviewCanvas": {
            preview2dRenderer = new WebGL2dPreviewRenderer(ev.data.canvas, gl, nodeRenderer);
            await preview2dRenderer.initialize();

            preview3dRenderer = new WebGL3dPreviewRenderer(ev.data.canvas, gl, nodeRenderer);
            await preview3dRenderer.initialize();
            preview3dRenderer.render(material);

            previewRenderer = preview3dRenderer;

            self.postMessage(RenderWorkerResponse.OK);
            break;
        }

        case "setPreviewMode": {
            if (ev.data.mode === PreviewMode.TwoD) {
                previewRenderer = preview2dRenderer;
            } else {
                previewRenderer = preview3dRenderer;
            }

            previewRenderer.render(material);

            self.postMessage(RenderWorkerResponse.OK);
            break;
        }

        case "set3dPreviewSettings": {
            preview3dRenderer?.updateSettings(ev.data.settings).then(() => {
                preview3dRenderer.render(material);
                self.postMessage(RenderWorkerResponse.OK);
            });

            break;
        }

        case "set2dPreviewSettings": {
            preview2dRenderer?.updateSettings(ev.data.settings).then(() => {
                preview2dRenderer.render(material);
                self.postMessage(RenderWorkerResponse.OK);
            });

            break;
        }
    }
};

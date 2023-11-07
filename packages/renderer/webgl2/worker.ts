import { RenderWorkerCommand } from "../commands";
import RenderJobScheduler from "../scheduler";
import { RenderableMaterialSnapshot } from "../types";
import WebGLEnvironmentalPreviewRenderer from "./env-preview-renderer";
import WebGLNodePreviewsRenderer from "./node-previews-renderer";
import WebGLNodeRenderer from "./node-renderer";

let canvas: OffscreenCanvas;
let gl: WebGL2RenderingContext;
let material: RenderableMaterialSnapshot;
let nodeRenderer: WebGLNodeRenderer;
let nodePreviewsRenderer: WebGLNodePreviewsRenderer;
let envPreviewRenderer: WebGLEnvironmentalPreviewRenderer;
let jobScheduler: RenderJobScheduler;

function renderQueuedNodes(nodeIds: Array<number>) {
    nodeIds.forEach((id) => {
        const node = material.nodes[id];
        if (node) {
            nodeRenderer.render(node);
        }
    });

    nodePreviewsRenderer.render(material);
    envPreviewRenderer?.render(material);
}

self.onmessage = (ev: MessageEvent<RenderWorkerCommand>) => {
    switch (ev.data.command) {
        case "initialize": {
            material = ev.data.material;
            canvas = ev.data.canvas;

            gl = canvas.getContext("webgl2")!;
            gl.clearColor(0, 0, 0, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);

            nodeRenderer = new WebGLNodeRenderer(gl);
            nodePreviewsRenderer = new WebGLNodePreviewsRenderer(canvas, gl, nodeRenderer);

            jobScheduler = new RenderJobScheduler(material);

            if (ev.data.start) {
                jobScheduler.start(renderQueuedNodes);
            }

            break;
        }

        case "synchronizeNode": {
            // If the command contains a snapshot then the node was either just added to
            // the material or modified.
            if (ev.data.nodeSnapshot) {
                const node = material.nodes[ev.data.nodeId];

                // If that node already exists inside worker's copy of the material
                // then we just need to update it and schedule a re-render of itself
                // and its outputs (recursively).
                if (node) {
                    const justMoved =
                        node.node.x !== ev.data.nodeSnapshot.node.x ||
                        node.node.y !== ev.data.nodeSnapshot.node.y;

                    node.node = ev.data.nodeSnapshot.node;
                    node.inputs = ev.data.nodeSnapshot.inputs;
                    node.outputs = ev.data.nodeSnapshot.outputs;

                    // Don't re-render the node if all we did was change its position.
                    // Because of this it won't re-render if we change some parameter
                    // and position in a single call, but that doesn't ever happen.
                    if (justMoved) {
                        // If we don't schedule any render job for this node then
                        // the preview will not update, so we must update it manually.
                        nodePreviewsRenderer.render(material);
                    } else {
                        jobScheduler.scheduleOutputs(ev.data.nodeId);
                    }
                } else {
                    if ("blueprint" in ev.data.nodeSnapshot) {
                        material.nodes[ev.data.nodeId] = ev.data.nodeSnapshot;
                    } else {
                        console.error(
                            "Error: UI <-> Worker desync: Received update of a node that does not exist.",
                        );
                        return;
                    }

                    jobScheduler.schedule(ev.data.nodeId);
                }
            } else {
                nodeRenderer.clearNodeCache(ev.data.nodeId);
                jobScheduler.scheduleOutputs(ev.data.nodeId, true);
                delete material.nodes[ev.data.nodeId];

                // FIXME:
                // It seems like sometimes the preview is not updated after
                // removing a node. It's possible that the scheduler callback
                // runs right before `delete`. Very difficult to reproduce.
                nodePreviewsRenderer.render(material);
            }

            break;
        }

        case "renderNodeAndGetImage": {
            const requestedNodeId = ev.data.nodeId;
            const tempScheduler = new RenderJobScheduler(material);
            tempScheduler.scheduleChain(ev.data.nodeId);
            tempScheduler.runOnce((ids) => {
                for (const nodeId of ids) {
                    const node = material.nodes[nodeId];
                    if (nodeId === requestedNodeId) {
                        const imageData = nodeRenderer.renderToImageData(node);
                        self.postMessage(imageData, { transfer: [imageData.data.buffer] });
                        break;
                    } else {
                        nodeRenderer.render(node);
                    }
                }
            });
            break;
        }

        case "setEditorUIViewportSize": {
            canvas.width = ev.data.width;
            canvas.height = ev.data.height;
            nodePreviewsRenderer.updateCameraMatrix();
            nodePreviewsRenderer.render(material);
            break;
        }

        case "setEditorUITransform": {
            nodePreviewsRenderer.updateCamera(ev.data.x, ev.data.y, ev.data.scale);
            nodePreviewsRenderer.render(material);
            break;
        }

        case "setEnvironmentPreviewDestination": {
            envPreviewRenderer = new WebGLEnvironmentalPreviewRenderer(
                ev.data.canvas,
                gl,
                nodeRenderer,
            );
            envPreviewRenderer.render(material);
            break;
        }

        case "setEnvironmentPreviewCameraTransform": {
            envPreviewRenderer?.setCameraTransform(
                ev.data.rotationX,
                ev.data.rotationY,
                ev.data.zoom,
            );
            envPreviewRenderer?.render(material);
            break;
        }
    }
};

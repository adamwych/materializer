import {
    Material,
    MaterialNode,
    MaterialNodeRuntimeInfo,
    MaterialNodeType,
} from "../types/material.ts";
import { DeepReadonly } from "ts-essentials";
import {
    NodeRenderJobInfo,
    NodeRenderJobResult,
    PreviewRenderJobResult,
    RenderJobInfo,
} from "./job.ts";
import RenderingEngine from "./engine.ts";
import { RenderJobResult } from "./job-result.ts";
import { MaterialNodeOutputBitmap } from "./output.ts";

export default class RenderingScheduler {
    private jobs: Array<RenderJobInfo> = [];

    constructor(private readonly engine: RenderingEngine) {}

    public process() {
        this.processOnce();

        // Artificially delay processing because WebGL context might get lost
        // if updates are too frequent. Target roughly 60 frames per second.
        setTimeout(
            () => {
                requestAnimationFrame(() => this.process());
            },
            (1 / 60) * 1000,
        );
    }

    public processOnce() {
        for (const job of this.jobs) {
            this.engine.runJob(job);
        }

        this.jobs = [];
    }

    /**
     * Schedules a new rendering job for specified node.
     * This does not automatically schedule re-renders for nodes
     * whose input sockets are connected to this node's output sockets,
     * for this use {@link RenderingScheduler#scheduleChain}.
     *
     * @param material
     * @param node
     * @param info
     */
    public schedule(
        material: DeepReadonly<Material>,
        node: DeepReadonly<MaterialNode>,
        info: DeepReadonly<MaterialNodeRuntimeInfo>,
    ): NodeRenderJobResult {
        const existingJob = this.jobs.find(
            (job) => job.type === "node" && job.node.id === node.id,
        );
        if (existingJob) {
            return (existingJob as NodeRenderJobInfo).result;
        }

        const result = new RenderJobResult<
            Map<string, MaterialNodeOutputBitmap>
        >("node", node.id);
        this.jobs.push({
            type: "node",
            material,
            node,
            info,
            result,
        });
        return result;
    }

    /**
     * Schedules a new rendering job for specified node and all nodes
     * connected to this node (recursively).
     *
     * @param material
     * @param startNode
     * @param resolveNode
     * @param resolveInfo
     */
    public scheduleChain(
        material: DeepReadonly<Material>,
        startNode: DeepReadonly<MaterialNode>,
        resolveNode: (nodeId: number) => DeepReadonly<MaterialNode>,
        resolveInfo: (nodeId: number) => DeepReadonly<MaterialNodeRuntimeInfo>,
    ): Array<NodeRenderJobResult | PreviewRenderJobResult> {
        const results = new Array<
            NodeRenderJobResult | PreviewRenderJobResult
        >();

        // Schedule render of all input nodes.
        const inputNodes = material.connections
            .filter((connection) => connection.to.nodeId === startNode.id)
            .map((connection) => resolveNode(connection.from.nodeId));
        for (const inputNode of inputNodes) {
            if (
                this.jobs.find(
                    (job) =>
                        job.type === "node" && job.node.id === inputNode.id,
                )
            ) {
                continue;
            }

            results.push(
                ...this.scheduleChain(
                    material,
                    inputNode,
                    resolveNode,
                    resolveInfo,
                ),
            );
        }

        // Schedule render of this node.
        results.push(
            this.schedule(material, startNode, resolveInfo(startNode.id)),
        );

        // Schedule render of all output nodes.
        const outputNodes = material.connections
            .filter((connection) => connection.from.nodeId === startNode.id)
            .map((connection) => resolveNode(connection.to.nodeId));
        for (const outputNode of outputNodes) {
            results.push(
                ...this.scheduleChain(
                    material,
                    outputNode,
                    resolveNode,
                    resolveInfo,
                ),
            );
        }

        // If there's a job to render an output node, then we should also
        // schedule a job to re-render to preview.
        const willRenderOutputNode = this.jobs.some(
            (job) =>
                job.type === "node" &&
                job.node.type === MaterialNodeType.Output,
        );
        if (willRenderOutputNode) {
            results.push(this.schedulePreviewUpdate(material));
        }

        return results;
    }

    /**
     * Schedules a re-render of the preview window's contents.
     */
    public schedulePreviewUpdate(
        material: DeepReadonly<Material>,
    ): PreviewRenderJobResult {
        const result = new RenderJobResult<ImageBitmap>("preview");
        this.jobs.push({
            type: "preview",
            material,
            result,
        });
        return result;
    }
}

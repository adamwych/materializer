import {Material, MaterialNode, MaterialNodeRuntimeInfo, MaterialNodeType,} from "../types/material.ts";
import {DeepReadonly} from "ts-essentials";
import {NodeRenderJobInfo, NodeRenderJobResult, PreviewRenderJobResult, RenderJobInfo,} from "./job.ts";
import RenderingEngine from "./engine.ts";
import {RenderJobResult} from "./job-result.ts";
import {MaterialNodeOutputBitmap} from "./output.ts";

/**
 * Scheduler takes care of preparing a list of jobs for the {@link RenderingEngine} to run.
 *
 * Jobs can be scheduled at any time, but they are ran in a fixed timeframe to prevent
 * freezing the UI if there's a lot of work to do at once and to detect unnecessary
 * back-to-back re-renders. In the future it should also contain logic to split the work
 * into multiple animation frames to further prevent freezing.
 */
export default class RenderingScheduler {
    private jobs: Array<RenderJobInfo> = [];

    /**
     * Constructs a new scheduler for given engine.
     * To start processing queued jobs call {@link RenderingScheduler#run}.
     *
     * @param engine
     */
    constructor(private readonly engine: RenderingEngine) {}

    /**
     * Starts an infinite loop during which queued jobs will be run.
     * This method is not blocking, jobs are processed during an animation frame.
     */
    public run() {
        this.runOnce();

        requestAnimationFrame(() => this.run());
    }

    /**
     * Runs all queued jobs and clears the queue.
     */
    public runOnce() {
        for (const job of this.jobs) {
            this.engine.runJob(job);
        }

        this.jobs = [];
    }

    /**
     * Schedules a new rendering job for given node.
     *
     * Note that this will only render this exact node, it will not schedule
     * re-renders for inputs of this node, so the result might be outdated if
     * for example parameters of this node's inputs have changed since the last
     * time they were rendered.
     *
     * To also re-render the inputs use {@link RenderingScheduler#scheduleChain} instead.
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
        // Prevent scheduling multiple render jobs for the same node.
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
     * Evaluates inputs and outputs of given node and schedules rendering
     * jobs for all of them.
     *
     * To only render a specific node use {@link RenderingScheduler#schedule} instead.
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

import { MaterialSnapshot } from "./types";

export type SubmitRenderJobsCallback = (nodeIds: Array<number>) => void;

export default class RenderJobScheduler {
    private readonly queue = new Set<number>();

    constructor(private readonly material: MaterialSnapshot) {}

    public start(callback: SubmitRenderJobsCallback) {
        for (const snapshot of this.material.nodes.values()) {
            this.scheduleChain(snapshot.node.id);
        }

        requestAnimationFrame(() => this.tick(callback));
    }

    private tick(callback: SubmitRenderJobsCallback) {
        this.runOnce(callback);
        requestAnimationFrame(() => this.tick(callback));
    }

    public runOnce(callback: SubmitRenderJobsCallback) {
        if (this.queue.size > 0) {
            callback(Array.from(this.queue));
            this.queue.clear();
        }
    }

    /**
     * Schedules a render job for given node.
     *
     * Note that this will only render this exact node, it will not schedule
     * re-renders for inputs of this node, so the result might be outdated if
     * for example parameters of this node's inputs have changed since the last
     * time they were rendered.
     *
     * To also re-render the inputs use `scheduleChain` instead.
     *
     * @param nodeId
     */
    public schedule(nodeId: number) {
        if (!this.queue.has(nodeId)) {
            this.queue.add(nodeId);
        }
    }

    /**
     * Recursively schedules render jobs for given node, its inputs and its outputs.
     * To only render a specific node use `schedule` instead.
     *
     * @param nodeId
     */
    public scheduleChain(nodeId: number) {
        if (!this.queue.has(nodeId)) {
            this.getInputNodes(nodeId).forEach((id) => this.scheduleChain(id));
            this.schedule(nodeId);
            this.getOutputNodes(nodeId).forEach((id) => this.scheduleChain(id));
        }
    }

    /**
     * Recursively schedules a render job for given node and its outputs.
     *
     * @param nodeId
     * @param skipSelf
     */
    public scheduleOutputs(nodeId: number, skipSelf = false) {
        if (!this.queue.has(nodeId)) {
            if (!skipSelf) {
                this.schedule(nodeId);
            }

            this.getOutputNodes(nodeId).forEach((id) => this.scheduleOutputs(id));
        }
    }

    private getInputNodes(nodeId: number): Array<number> {
        return this.material.edges
            .filter((edge) => edge.to[0] === nodeId)
            .map((edge) => edge.from[0]);
    }

    private getOutputNodes(nodeId: number): Array<number> {
        return this.material.edges
            .filter((edge) => edge.from[0] === nodeId)
            .map((edge) => edge.to[0]);
    }
}

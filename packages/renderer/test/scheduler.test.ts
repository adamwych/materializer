import { afterEach, describe, expect, it, vi } from "vitest";
import { MaterialGraphEdge } from "../../material/graph";
import RenderJobScheduler from "../scheduler";
import { MaterialNodeSnapshot } from "../types";

// [Solid color]->[Output]
const SCENARIO_0: Array<MaterialGraphEdge> = [{ from: [0, ""], to: [1, ""] }];

// [Solid color]->[Output]
//        V------>[Blend]
const SCENARIO_1: Array<MaterialGraphEdge> = [
    { from: [0, ""], to: [1, ""] },
    { from: [0, ""], to: [2, ""] },
];

// [Solid color]->[Output]
//        V------>[Blend]
//                   V------>[Invert]
const SCENARIO_2: Array<MaterialGraphEdge> = [
    { from: [0, ""], to: [1, ""] },
    { from: [0, ""], to: [2, ""] },
    { from: [2, ""], to: [3, ""] },
];

function createTestScheduler(edges: Array<MaterialGraphEdge>): RenderJobScheduler {
    return new RenderJobScheduler({
        edges: edges,

        // Nodes can be empty, because scheduler only uses the list of edges.
        nodes: new Map<number, MaterialNodeSnapshot>(),
    });
}

describe("RenderJobScheduler", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should not call render callback if there were no changes", () => {
        const scheduler = createTestScheduler(SCENARIO_0);
        const renderCallback = vi.fn();
        scheduler.runOnce(renderCallback);
        expect(renderCallback).not.toHaveBeenCalled();
    });

    it("should schedule a re-render of node and its outputs (simple)", () => {
        const scheduler = createTestScheduler(SCENARIO_0);
        const renderCallback = vi.fn();
        scheduler.scheduleOutputs(0);
        scheduler.runOnce(renderCallback);
        expect(renderCallback).toHaveBeenCalledWith([0, 1]);
    });

    it("should schedule a re-render of node and its outputs (advanced)", () => {
        const scheduler = createTestScheduler(SCENARIO_2);
        const renderCallback = vi.fn();
        scheduler.scheduleOutputs(0);
        scheduler.runOnce(renderCallback);
        expect(renderCallback).toHaveBeenCalledWith([0, 1, 2, 3]);
    });

    it("should not schedule a re-render node's inputs", () => {
        const scheduler = createTestScheduler(SCENARIO_1);
        const renderCallback = vi.fn();
        scheduler.scheduleOutputs(1);
        scheduler.runOnce(renderCallback);
        expect(renderCallback).toHaveBeenCalledWith([1]);
    });

    it("should not schedule back-to-back renders of the same node", () => {
        const scheduler = createTestScheduler(SCENARIO_1);
        const renderCallback = vi.fn();
        scheduler.scheduleOutputs(1);
        scheduler.scheduleOutputs(1);
        scheduler.runOnce(renderCallback);
        expect(renderCallback).toHaveBeenCalledWith([1]);
    });

    it("should batch multiple changes into a single render", () => {
        const scheduler = createTestScheduler(SCENARIO_2);
        const renderCallback = vi.fn();
        scheduler.scheduleOutputs(1);
        scheduler.scheduleOutputs(2);
        scheduler.scheduleOutputs(0);
        scheduler.runOnce(renderCallback);
        expect(renderCallback).toHaveBeenCalledWith([1, 2, 3, 0, 1, 2, 3]);
    });
});

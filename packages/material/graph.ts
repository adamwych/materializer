import { MaterialNodeBlueprint } from "./node";
import { MaterialNodeSocketAddr } from "./node-socket";

/**
 * Describes a connection between two distinct node sockets.
 */
export type MaterialGraphEdge = {
    from: MaterialNodeSocketAddr;
    to: MaterialNodeSocketAddr;
};

/**
 * Checks whether given edge is valid.
 *
 * @param edge
 * @param sourceBlueprint
 * @param destinationBlueprint
 */
export function isGraphEdgeValid(
    edge: MaterialGraphEdge,
    sourceBlueprint: MaterialNodeBlueprint,
    destinationBlueprint: MaterialNodeBlueprint,
) {
    const isSourceAnInput = edge.from[1] in sourceBlueprint.inputs;
    const isSourceAnOutput = edge.from[1] in sourceBlueprint.outputs;
    const isDestinationAnInput = edge.to[1] in destinationBlueprint.inputs;
    const isDestinationAnOutput = edge.to[1] in destinationBlueprint.outputs;

    // Prevent specifying input and output in the wrong order.
    if (isSourceAnInput && isDestinationAnOutput) {
        return false;
    }

    // Prevent connecting sockets from the same node with each other.
    if (edge.from[0] === edge.to[0]) {
        return false;
    }

    // Prevent Input<->Input and Output<->Output edges.
    if ((isSourceAnOutput && isDestinationAnOutput) || (isSourceAnInput && isDestinationAnInput)) {
        return false;
    }

    return true;
}

/**
 * Swaps source and destination of a {@link MaterialGraphEdge}, but
 * only if they are in the wrong order (e.g. if source socket is an input).
 *
 * @param edge
 * @param sourceBlueprint
 * @param destinationBlueprint
 * @returns Whether sockets were swapped.
 */
export function invertGraphEdgeIfApplicable(
    edge: MaterialGraphEdge,
    sourceBlueprint: MaterialNodeBlueprint,
    destinationBlueprint: MaterialNodeBlueprint,
) {
    const isSourceAnInput = edge.from[1] in sourceBlueprint.inputs;
    const isDestinationAnOutput = edge.to[1] in destinationBlueprint.outputs;

    if (isSourceAnInput && isDestinationAnOutput) {
        [edge.from, edge.to] = [edge.to, edge.from];
        return true;
    }

    return false;
}

/**
 * Compares two graph edges and returns whether they both describe the same connection.
 *
 * @param a Edge to compare against `b`.
 * @param b Edge to compare against `a`.
 */
export function areGraphEdgesSimilar(a: MaterialGraphEdge, b: MaterialGraphEdge) {
    return (
        a.from[0] === b.from[0] &&
        a.from[1] === b.from[1] &&
        a.to[0] === b.to[0] &&
        a.to[1] === b.to[1]
    );
}

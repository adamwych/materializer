import { createContextProvider } from "@solid-primitives/context";
import { createEmitter } from "@solid-primitives/event-bus";
import { unwrap } from "solid-js/store";
import { MaterialEvents } from "../types/material-events";
import { MaterialNode } from "../types/node";
import { MaterialNodeSocketAddr } from "../types/node-socket";
import {
    EDITOR_GRAPH_HEIGHT,
    EDITOR_GRAPH_WIDTH,
    EDITOR_NODE_HEIGHT,
    EDITOR_NODE_WIDTH,
} from "../ui/editor/consts";
import { clamp } from "../utils/math";
import { useNodeBlueprintsStore } from "./blueprints";
import { useWorkspaceStore } from "./workspace";

/**
 * Provides access to the active {@link Material} and functions that modify it.
 */
export const [MaterialProvider, useMaterialStore] = createContextProvider(() => {
    const workspace = useWorkspaceStore()!;
    const material = workspace.getActiveMaterial()!;
    const pkgsRegistry = useNodeBlueprintsStore()!;
    const events = createEmitter<MaterialEvents>();

    return {
        instantiateNode(path: string, x: number, y: number) {
            const spec = pkgsRegistry.getBlueprintByPath(path)!;

            workspace.modifyMaterial(material.id, (material) => {
                const parameters: Record<string, unknown> = {};
                Object.values(spec.parameters).forEach((info) => {
                    parameters[info.id] = info.default;
                });

                const nextNodeId =
                    Math.max(0, ...(Object.keys(material.nodes) as any as number[])) + 1;
                material.nodes[nextNodeId] = {
                    id: nextNodeId,
                    name: spec.name,
                    path: path,
                    x,
                    y,
                    parameters,
                    textureSize: spec.preferredTextureSize,
                };

                events.emit("nodeAdded", {
                    node: material.nodes[nextNodeId],
                });
            });
        },

        moveNode(id: number, x: number, y: number) {
            workspace.modifyMaterial(material.id, (material) => {
                const node = material.nodes[id];
                if (node) {
                    node.x = clamp(node.x + x, 0, EDITOR_GRAPH_WIDTH - EDITOR_NODE_WIDTH);
                    node.y = clamp(node.y + y, 0, EDITOR_GRAPH_HEIGHT - EDITOR_NODE_HEIGHT);
                    events.emit("nodeMoved", { node });
                }
            });
        },

        removeNode(id: number) {
            workspace.modifyMaterial(material.id, (material) => {
                const node = material.nodes[id];

                delete material.nodes[id];

                events.emit("nodeRemoved", {
                    node,
                });

                material.connections = material.connections.filter((connection) => {
                    return connection.from[0] !== id && connection.to[0] !== id;
                });
            });
        },

        setNodeParameter<T>(nodeId: number, parameterId: string, value: T) {
            workspace.modifyMaterial(material.id, (material) => {
                const node = material.nodes[nodeId];
                if (node) {
                    node.parameters[parameterId] = value;
                    events.emit("nodeParameterChanged", {
                        node,
                    });
                }
            });
        },

        addConnection(
            sourceNodeId: number,
            sourceSocketId: string,
            destinationNodeId: number,
            destinationSocketId: string,
        ) {
            workspace.modifyMaterial(material.id, (material) => {
                // Prevent from connecting sockets from the same node with each other.
                if (sourceNodeId === destinationNodeId) {
                    return;
                }

                // Swap source and destination if they are in wrong order.
                const sourceNodeBlueprint = this.getNodeBlueprint(sourceNodeId)!;
                const isSourceAnInput = sourceSocketId in sourceNodeBlueprint.inputs;
                const isSourceAnOutput = sourceSocketId in sourceNodeBlueprint.outputs;

                const destinationNodeBlueprint = this.getNodeBlueprint(destinationNodeId)!;
                const isDestinationAnInput = destinationSocketId in destinationNodeBlueprint.inputs;
                const isDestinationAnOutput =
                    destinationSocketId in destinationNodeBlueprint.outputs;

                if (isSourceAnInput && isDestinationAnOutput) {
                    [sourceNodeId, destinationNodeId] = [destinationNodeId, sourceNodeId];
                    [sourceSocketId, destinationSocketId] = [destinationSocketId, sourceSocketId];
                }

                // Prevent from connecting sockets of the same kind with each other.
                if (
                    (isSourceAnOutput && isDestinationAnOutput) ||
                    (isSourceAnInput && isDestinationAnInput)
                ) {
                    return;
                }

                // Removing existing connection to the destination socket if there is one.
                const existingConnectionIdx = material.connections.findIndex((connection) => {
                    return (
                        connection.to[0] === destinationNodeId &&
                        connection.to[1] === destinationSocketId
                    );
                });
                if (existingConnectionIdx > -1) {
                    material.connections.splice(existingConnectionIdx, 1);
                }

                // Finally add it to the list.
                material.connections.push({
                    from: [sourceNodeId, sourceSocketId],
                    to: [destinationNodeId, destinationSocketId],
                });

                // TODO: Maybe a single `nodeConnectionAdded` event would be better?
                events.emit("nodeConnectionsChanged", { node: this.getNodeById(sourceNodeId) });
                events.emit("nodeConnectionsChanged", {
                    node: this.getNodeById(destinationNodeId),
                });
            });
        },

        anyConnectionToSocket(nodeId: number, socketId: string) {
            return material.connections.some(
                (x) =>
                    (x.from[0] === nodeId && x.from[1] === socketId) ||
                    (x.to[0] === nodeId && x.to[1] === socketId),
            );
        },

        getInputsMap(node: MaterialNode): Map<string, MaterialNodeSocketAddr> {
            return new Map<string, MaterialNodeSocketAddr>(
                material.connections
                    .filter((connection) => connection.to[0] === node.id)
                    .map((connection) => [connection.to[1], unwrap(connection.from)]),
            );
        },

        getOutputsMap(node: MaterialNode): Map<string, MaterialNodeSocketAddr> {
            return new Map<string, MaterialNodeSocketAddr>(
                material.connections
                    .filter((connection) => connection.from[0] === node.id)
                    .map((connection) => [connection.from[1], unwrap(connection.to)]),
            );
        },

        getNodeById(id: number) {
            return material.nodes[id];
        },

        getNodeBlueprint(nodeId: number) {
            return pkgsRegistry.getBlueprintByPath(this.getNodeById(nodeId)!.path);
        },

        getEvents() {
            return events;
        },

        getMaterial() {
            return material;
        },
    };
});

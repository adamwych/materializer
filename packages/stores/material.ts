import { createContextProvider } from "@solid-primitives/context";
import { createEmitter } from "@solid-primitives/event-bus";
import { createMutable, unwrap } from "solid-js/store";
import {
    MaterialGraphEdge,
    areGraphEdgesSimilar,
    isGraphEdgeValid,
    invertGraphEdgeIfApplicable,
} from "../types/graph";
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

    function notifyGraphEdgeChanged(edge: MaterialGraphEdge) {
        events.emit("nodeConnectionsChanged", {
            node: material.nodes.get(edge.from[0])!,
        });
        events.emit("nodeConnectionsChanged", {
            node: material.nodes.get(edge.to[0])!,
        });
    }

    return {
        instantiateNode(path: string, x: number, y: number) {
            const spec = pkgsRegistry.getBlueprintByPath(path)!;
            const parameters: Record<string, unknown> = {};
            Object.values(spec.parameters).forEach((info) => {
                parameters[info.id] = info.default;
            });

            const nextNodeId = Math.max(0, ...Array.from(material.nodes.keys())) + 1;
            const node: MaterialNode = createMutable({
                id: nextNodeId,
                name: spec.name,
                path: path,
                x,
                y,
                parameters,
                textureSize: spec.preferredTextureSize,
            });

            workspace.modifyMaterial(material.id, (material) => {
                material.nodes.set(nextNodeId, node);

                events.emit("nodeAdded", {
                    node,
                });
            });

            return node;
        },

        moveNode(id: number, x: number, y: number) {
            workspace.modifyMaterial(material.id, (material) => {
                const node = material.nodes.get(id);
                if (node) {
                    node.x = clamp(node.x + x, 0, EDITOR_GRAPH_WIDTH - EDITOR_NODE_WIDTH);
                    node.y = clamp(node.y + y, 0, EDITOR_GRAPH_HEIGHT - EDITOR_NODE_HEIGHT);
                    events.emit("nodeMoved", { node });
                }
            });
        },

        removeNode(id: number) {
            workspace.modifyMaterial(material.id, (material) => {
                const node = material.nodes.get(id);
                if (node) {
                    material.nodes.delete(id);

                    material.connections = material.connections.filter((connection) => {
                        return connection.from[0] !== id && connection.to[0] !== id;
                    });

                    events.emit("nodeRemoved", {
                        node,
                    });
                }
            });
        },

        setNodeParameter<T>(nodeId: number, parameterId: string, value: T) {
            workspace.modifyMaterial(material.id, (material) => {
                const node = material.nodes.get(nodeId);
                if (node) {
                    node.parameters[parameterId] = value;
                    events.emit("nodeParameterChanged", {
                        node,
                    });
                }
            });
        },

        /**
         * Adds a {@link MaterialGraphEdge} to the material and optionally emits
         * `nodeConnectionsChanged` events for both source and destination nodes.
         *
         * The edge will be automatically swapped if the `from` socket is an
         * input and the `to` socket is an output.
         *
         * Sockets within the edge must be from distinct nodes, otherwise it
         * will not be added.
         *
         * If the destination socket is already connected to an output, that edge
         * will be removed.
         *
         * @param edge Edge to add.
         * @param emitEvents
         */
        addEdge(edge: MaterialGraphEdge, emitEvents = true) {
            let sourceNodeBlueprint = this.getNodeBlueprint(edge.from[0])!;
            let destinationNodeBlueprint = this.getNodeBlueprint(edge.to[0])!;

            if (invertGraphEdgeIfApplicable(edge, sourceNodeBlueprint, destinationNodeBlueprint)) {
                [sourceNodeBlueprint, destinationNodeBlueprint] = [
                    destinationNodeBlueprint,
                    sourceNodeBlueprint,
                ];
            }

            if (!isGraphEdgeValid(edge, sourceNodeBlueprint, destinationNodeBlueprint)) {
                console.warn("Attempted to add an invalid edge to the material.", edge);
                return;
            }

            workspace.modifyMaterial(material.id, (material) => {
                // Remove existing connection to the destination socket.
                this.removeEdgeTo(edge.to[0], edge.to[1], false);

                material.connections.push(edge);

                if (emitEvents) {
                    notifyGraphEdgeChanged(edge);
                }
            });
        },

        /**
         * Removes the edge connecting any socket from any node to the specified socket.
         *
         * @param nodeId
         * @param socketId
         * @param emitEvents
         */
        removeEdgeTo(nodeId: number, socketId: string, emitEvents = true) {
            workspace.modifyMaterial(material.id, (material) => {
                const index = material.connections.findIndex(
                    (edge) => edge.to[0] === nodeId && edge.to[1] === socketId,
                );
                if (index >= 0) {
                    const [removedEdge] = material.connections.splice(index, 1);

                    if (emitEvents) {
                        notifyGraphEdgeChanged(removedEdge);
                    }
                }
            });
        },

        /**
         * Removes specified edge from the material.
         *
         * @param edge
         * @param emitEvents
         */
        removeEdge(edge: MaterialGraphEdge, emitEvents = true) {
            workspace.modifyMaterial(material.id, (material) => {
                const index = material.connections.findIndex((otherEdge) =>
                    areGraphEdgesSimilar(edge, otherEdge),
                );
                if (index >= 0) {
                    material.connections.splice(index, 1);

                    if (emitEvents) {
                        notifyGraphEdgeChanged(edge);
                    }
                }
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
            return material.nodes.get(id);
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

        setName(name: string) {
            workspace.modifyMaterial(material.id, (material) => {
                material.name = name;
            });
        },

        getName() {
            return material.name;
        },
    };
});

export type MaterialStore = NonNullable<ReturnType<typeof useMaterialStore>>;

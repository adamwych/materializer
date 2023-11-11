import { createContextProvider } from "@solid-primitives/context";
import { createEmitter } from "@solid-primitives/event-bus";
import {
    RiEditorLink,
    RiEditorLinkUnlink,
    RiOthersBox1Line,
    RiSystemDeleteBinLine,
    RiSystemFilterLine,
} from "solid-icons/ri";
import { createMutable, modifyMutable, produce, unwrap } from "solid-js/store";
import {
    MaterialGraphEdge,
    areGraphEdgesSimilar,
    invertGraphEdgeIfApplicable,
    isGraphEdgeValid,
} from "../material/graph";
import { Material } from "../material/material";
import { MaterialEvents } from "../material/material-events";
import {
    MaterialNode,
    calculateNodesBoundingRect,
    makeDefaultBlueprintParameters,
} from "../material/node";
import { MaterialNodeSocketAddr } from "../material/node-socket";
import TextureFilterMethod from "../types/texture-filter";
import { useEditorHistory } from "../ui/editor/canvas/interaction/history";
import {
    EDITOR_GRAPH_HEIGHT,
    EDITOR_GRAPH_WIDTH,
    EDITOR_NODE_HEIGHT,
    EDITOR_NODE_WIDTH,
} from "../ui/editor/consts";
import { clamp } from "../utils/math";
import { useNodeBlueprintsStore } from "./blueprints";
import { WorkspaceClipboardState, useWorkspaceStore } from "./workspace";

/**
 * Provides access to the active {@link Material} and functions that modify it.
 */
export const [MaterialProvider, useMaterialStore] = createContextProvider(() => {
    const workspace = useWorkspaceStore()!;
    const material = workspace.getActiveMaterial()!;
    const pkgsRegistry = useNodeBlueprintsStore()!;
    const history = useEditorHistory();
    const events = createEmitter<MaterialEvents>();

    function modifyMaterial(setter: (current: Material) => void) {
        workspace.modifyMaterial(material.id, setter);
    }

    function modifyNode(nodeId: number, setter: (node: MaterialNode, material: Material) => void) {
        workspace.modifyMaterial(material.id, (material) => {
            const node = material.nodes.get(nodeId);
            if (node) {
                modifyMutable(
                    node,
                    produce((node) => setter(node, material)),
                );
            } else {
                console.warn("Attempted to modify a node that does not exist in the material.");
            }
        });
    }

    function notifyGraphEdgeChanged(edge: MaterialGraphEdge) {
        events.emit("nodeConnectionsChanged", {
            node: material.nodes.get(edge.from[0])!,
        });
        events.emit("nodeConnectionsChanged", {
            node: material.nodes.get(edge.to[0])!,
        });
    }

    function calculateNextNodeId() {
        return Math.max(0, ...Array.from(material.nodes.keys())) + 1;
    }

    return {
        /**
         * Adds given node to the material.
         * If a node with the same ID already exists in the material, it will be replaced.
         *
         * This is an internal function, generally you should prefer using the
         * `instantiateNode` function to add new nodes.
         *
         * @param node Node to add.
         * @param emitEvent Whether a `nodeAdded` event should be emitted. (Default: `true`)
         * @param pushToHistory Whether this action should be added to the history stack. (Default: `true`)
         */
        addNode(node: MaterialNode, emitEvent = true, pushToHistory = true) {
            modifyMaterial((material) => {
                material.nodes.set(node.id, createMutable(structuredClone(node)));

                if (emitEvent) {
                    events.emit("nodeAdded", { node });
                }
            });

            if (pushToHistory) {
                history?.pushAction(
                    `Add "${node.name}" node`,
                    RiOthersBox1Line,
                    ["material.addNode", node, emitEvent, false],
                    ["material.removeNode", node.id, emitEvent, false],
                );
            }
        },

        /**
         * Creates a new node based on given blueprint, places it at
         * specified X/Y position and then returns it.
         *
         * @param blueprintPath Path to the blueprint in `package_id/blueprint_id` format.
         * @param x Initial X position.
         * @param y Initial y position.
         * @param emitEvent Whether a `nodeAdded` event should be emitted. (Default: `true`)
         * @param pushToHistory Whether this action should be added to the history stack. (Default: `true`)
         * @returns Added node.
         */
        instantiateNode(
            blueprintPath: string,
            x: number,
            y: number,
            emitEvent = true,
            pushToHistory = true,
        ) {
            const blueprint = pkgsRegistry.getBlueprintByPath(blueprintPath)!;
            const node: MaterialNode = {
                id: calculateNextNodeId(),
                name: blueprint.name,
                path: blueprintPath,
                x,
                y,
                parameters: makeDefaultBlueprintParameters(blueprint),
                textureSize: blueprint.preferredTextureSize,
                textureFilterMethod: TextureFilterMethod.Linear,
            };

            this.addNode(node, emitEvent, pushToHistory);

            return node;
        },

        /**
         * Adds a new node using the same blueprint as specified node and
         * copies all parameters from the original node to the new one.
         *
         * Edges from or to this node will not be duplicated.
         *
         * @param nodeId
         * @param emitEvent Whether a `nodeAdded` event should be emitted. (Default: `true`)
         * @return Added node or `undefined` if original node does not exist.
         */
        duplicateNode(nodeId: number, emitEvent = true): MaterialNode | undefined {
            let newNode: MaterialNode | undefined;

            modifyNode(nodeId, (node) => {
                newNode = {
                    ...structuredClone(unwrap(node)),
                    id: calculateNextNodeId(),
                    name: node.name + " (Copy)",
                    parameters: structuredClone(unwrap(node.parameters)),
                    x: node.x + 64,
                    y: node.y + 64,
                };
                this.addNode(newNode, emitEvent);
            });

            return newNode;
        },

        /**
         * Duplicates a set of nodes and all edges connecthing them together.
         *
         * @param nodeIds
         * @returns
         */
        duplicateNodes(nodeIds: Array<number>): Array<MaterialNode> {
            const duplicatedNodes: Array<MaterialNode | undefined> = [];

            // TODO: Combine into a single history action.

            // Duplicating nodes and edges must be done is separate stages
            // because we can not guarantee that the order of nodes in `nodeIds`
            // is correct.

            nodeIds.forEach((nodeId) => {
                duplicatedNodes.push(this.duplicateNode(nodeId));
            });

            nodeIds.forEach((originalNodeId, i) => {
                const duplicatedNode = duplicatedNodes[i];
                if (!duplicatedNode) {
                    return;
                }

                material.edges
                    .filter((edge) => edge.from[0] === originalNodeId)
                    .forEach((edge) => {
                        // Find corresponding destination node.
                        const destinationNodeIdx = nodeIds.indexOf(edge.to[0]);
                        const duplicatedDestinationNode = duplicatedNodes[destinationNodeIdx];

                        // If the destination node was not duplicated then skip this edge.
                        if (!duplicatedDestinationNode) {
                            return;
                        }

                        this.addEdge({
                            from: [duplicatedNode.id, edge.from[1]],
                            to: [duplicatedDestinationNode.id, edge.to[1]],
                        });
                    });
            });

            return duplicatedNodes.filter((x): x is MaterialNode => !!x);
        },

        /**
         * Moves node by given ID to specified position.
         *
         * @param nodeId ID of the node to move.
         * @param x New X position.
         * @param y New Y position.
         * @param emitEvent Whether a `nodeMoved` event should be emitted. (Default: `true`)
         */
        moveNodeTo(nodeId: number, x: number, y: number, emitEvent = true) {
            modifyNode(nodeId, (node) => {
                if (node.x === x && node.y === y) {
                    return;
                }

                node.x = clamp(x, 0, EDITOR_GRAPH_WIDTH - EDITOR_NODE_WIDTH);
                node.y = clamp(y, 0, EDITOR_GRAPH_HEIGHT - EDITOR_NODE_HEIGHT);

                if (emitEvent) {
                    events.emit("nodeMoved", { node });
                }
            });
        },

        /**
         * Removes a node by given ID from the material.
         *
         * @param nodeId ID of the node to remove.
         * @param emitEvent Whether a `nodeRemoved` event should be emitted. (Default: `true`)
         * @param pushToHistory Whether this action should be added to the history stack. (Default: `true`)
         */
        removeNode(nodeId: number, emitEvent = true, pushToHistory = true) {
            modifyMaterial((material) => {
                const node = material.nodes.get(nodeId);
                if (node) {
                    for (let i = material.edges.length - 1; i >= 0; i--) {
                        const edge = material.edges[i];
                        if (edge.from[0] === nodeId || edge.to[0] === nodeId) {
                            this.removeEdge(edge);
                        }
                    }

                    material.nodes.delete(nodeId);

                    if (emitEvent) {
                        events.emit("nodeRemoved", { node });
                    }

                    if (pushToHistory) {
                        history?.pushAction(
                            `Remove ${node.name} node`,
                            RiSystemDeleteBinLine,
                            ["material.removeNode", node.id, emitEvent, false],
                            ["material.addNode", node, emitEvent, false],
                        );
                    }
                }
            });
        },

        /**
         * Changes the value of a parameter for given node.
         *
         * @param nodeId ID of the node.
         * @param parameterId ID of the parameter.
         * @param value New value.
         * @param emitEvent Whether a `nodeParameterChanged` event should be emitted. (Default: `true`)
         * @param pushToHistory Whether this action should be added to the history stack. (Default: `true`)
         */
        setNodeParameter<T>(
            nodeId: number,
            parameterId: string,
            value: T,
            emitEvent = true,
            pushToHistory = true,
        ) {
            modifyNode(nodeId, (node) => {
                const previousValue = unwrap(node.parameters[parameterId]);

                node.parameters[parameterId] = value;

                if (emitEvent) {
                    events.emit("nodeParameterChanged", { node });
                }

                if (pushToHistory) {
                    history?.pushNodeParameterValueChanged(node, parameterId, value, previousValue);
                }
            });
        },

        setNodeTextureSize(nodeId: number, value: number, emitEvent = true, pushToHistory = true) {
            modifyNode(nodeId, (node) => {
                const previousValue = unwrap(node.textureSize);

                node.textureSize = value;

                if (emitEvent) {
                    events.emit("nodeParameterChanged", { node });
                }

                if (pushToHistory) {
                    history?.pushNodeTextureSizeChanged(node, value, previousValue);
                }
            });
        },

        setNodeTextureFilterMethod(
            nodeId: number,
            value: TextureFilterMethod,
            emitEvent = true,
            pushToHistory = true,
        ) {
            modifyNode(nodeId, (node) => {
                const previousValue = unwrap(node.textureFilterMethod);

                node.textureFilterMethod = value;

                if (emitEvent) {
                    events.emit("nodeParameterChanged", { node });
                }

                if (pushToHistory) {
                    history?.pushAction(
                        `Set ${node.name} texture filter method`,
                        RiSystemFilterLine,
                        ["material.setNodeTextureFilterMethod", node.id, value, true, false],
                        [
                            "material.setNodeTextureFilterMethod",
                            node.id,
                            previousValue,
                            true,
                            false,
                        ],
                    );
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
         * @param emitEvents Whether `nodeConnectionsChanged` events should be emitted.
         * @param pushToHistory Whether this action should be added to the history stack. (Default: `true`)
         */
        addEdge(edge: MaterialGraphEdge, emitEvents = true, pushToHistory = true) {
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

            modifyMaterial((material) => {
                // Remove existing connection to the destination socket.
                this.removeEdgeTo(edge.to[0], edge.to[1], false);

                material.edges.push(edge);

                if (emitEvents) {
                    notifyGraphEdgeChanged(edge);
                }
            });

            if (pushToHistory) {
                history?.pushAction(
                    `Connect ${edge.from[1]} to ${edge.to[1]}`,
                    RiEditorLink,
                    ["material.addEdge", edge, emitEvents, false],
                    ["material.removeEdge", edge, emitEvents, false],
                );
            }
        },

        /**
         * Removes the edge connecting any socket from any node to the specified socket.
         *
         * Optionally emits `nodeConnectionsChanged` events for both source and
         * destination nodes.
         *
         * @param nodeId ID of the destination node.
         * @param socketId ID of the destination socket.
         * @param emitEvents Whether `nodeConnectionsChanged` events should be emitted.
         * @param pushToHistory Whether this action should be added to the history stack. (Default: `true`)
         */
        removeEdgeTo(nodeId: number, socketId: string, emitEvents = true, pushToHistory = true) {
            const edge = material.edges.find(
                (edge) => edge.to[0] === nodeId && edge.to[1] === socketId,
            );

            if (edge) {
                this.removeEdge(edge, emitEvents, pushToHistory);
            }
        },

        /**
         * Removes specified edge from the material.
         *
         * @param edge Edge to remove.
         * @param emitEvents Whether `nodeConnectionsChanged` events should be emitted.
         * @param pushToHistory Whether this action should be added to the history stack. (Default: `true`)
         */
        removeEdge(edge: MaterialGraphEdge, emitEvents = true, pushToHistory = true) {
            modifyMaterial((material) => {
                const index = material.edges.findIndex((otherEdge) =>
                    areGraphEdgesSimilar(edge, otherEdge),
                );
                if (index >= 0) {
                    const [removedEdge] = material.edges.splice(index, 1);

                    if (emitEvents) {
                        notifyGraphEdgeChanged(edge);
                    }

                    if (pushToHistory) {
                        history?.pushAction(
                            `Disconnect ${removedEdge.from[1]} from ${removedEdge.to[1]}`,
                            RiEditorLinkUnlink,
                            ["material.removeEdge", edge, emitEvents, false],
                            ["material.addEdge", edge, emitEvents, false],
                        );
                    }
                }
            });
        },

        /**
         * Adds nodes and edges stored in given clipboard state into the material.
         * All nodes will be offset so that the center point of a rectangle that
         * they make together will be at given `centerX` and `centerY` coordinates.
         *
         * @param state
         * @param centerX
         * @param centerY
         * @returns List of added nodes.
         */
        pasteClipboardState(
            state: WorkspaceClipboardState,
            centerX: number,
            centerY: number,
        ): Array<MaterialNode> {
            const addedNodes = new Map<number, MaterialNode>();

            const rect = calculateNodesBoundingRect(state.nodes);
            const rectCenterX = rect.x + rect.width / 2;
            const rectCenterY = rect.y + rect.height / 2;
            const offsetFromCenterX = centerX - rectCenterX;
            const offsetFromCenterY = centerY - rectCenterY;

            state.nodes.forEach((node) => {
                const pastedNode: MaterialNode = {
                    ...structuredClone(unwrap(node)),
                    id: calculateNextNodeId(),
                    x: node.x + offsetFromCenterX,
                    y: node.y + offsetFromCenterY,
                };
                this.addNode(pastedNode);
                addedNodes.set(node.id, pastedNode);
            });

            state.edges.forEach((edge) => {
                const fromNode = addedNodes.get(edge.from[0]);
                const toNode = addedNodes.get(edge.to[0]);
                if (fromNode && toNode) {
                    this.addEdge({
                        from: [fromNode.id, edge.from[1]],
                        to: [toNode.id, edge.to[1]],
                    });
                }
            });

            return Array.from(addedNodes.values());
        },

        /**
         * Calculates the effective size of an output node's texture.
         * This is basically the size of the node that's connected to it.
         *
         * @param nodeId ID of the output node.
         * @returns Texture size or `1` if output node is connected to any input.
         */
        getEffectiveOutputNodeSize(nodeId: number) {
            const node = this.getNodeById(nodeId);
            if (node) {
                const edge = this.getAllEdgesTo(nodeId)[0];
                if (edge) {
                    const connectedNode = this.getNodeById(edge.from[0]);
                    return connectedNode?.textureSize ?? 1;
                }
            }

            return 1;
        },

        /**
         * Returns a list of all edges connecting any socket of any node to
         * any socket of the node by given ID.
         * @param nodeId ID of the node.
         */
        getAllEdgesTo(nodeId: number) {
            return material.edges.filter((edge) => edge.to[0] === nodeId);
        },

        anyConnectionToSocket(nodeId: number, socketId: string) {
            return material.edges.some(
                (x) =>
                    (x.from[0] === nodeId && x.from[1] === socketId) ||
                    (x.to[0] === nodeId && x.to[1] === socketId),
            );
        },

        getInputsMap(node: MaterialNode): Map<string, MaterialNodeSocketAddr> {
            return new Map<string, MaterialNodeSocketAddr>(
                material.edges
                    .filter((connection) => connection.to[0] === node.id)
                    .map((connection) => [connection.to[1], unwrap(connection.from)]),
            );
        },

        getOutputsMap(node: MaterialNode): Map<string, MaterialNodeSocketAddr> {
            return new Map<string, MaterialNodeSocketAddr>(
                material.edges
                    .filter((connection) => connection.from[0] === node.id)
                    .map((connection) => [connection.from[1], unwrap(connection.to)]),
            );
        },

        getNodeById: (id: number) => material.nodes.get(id),
        getNodeBlueprint(nodeId: number) {
            return pkgsRegistry.getBlueprintByPath(this.getNodeById(nodeId)!.path);
        },

        getEvents: () => events,
        getMaterial: () => material,

        setName(name: string) {
            modifyMaterial((material) => {
                material.name = name;
            });
        },
        getName: () => material.name,
    };
});

export type MaterialStore = NonNullable<ReturnType<typeof useMaterialStore>>;

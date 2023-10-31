import { createContextProvider } from "@solid-primitives/context";
import { createEmitter } from "@solid-primitives/event-bus";
import { unwrap } from "solid-js/store";
import { DeepReadonly } from "ts-essentials";
import { useAppContext } from "../app-context.ts";
import {
    Material,
    MaterialNode,
    MaterialNodeParametersMap,
    MaterialNodeSocketAddr,
} from "../types/material.ts";
import TextureFilterMethod from "../types/texture-filter";
import { useWorkspaceContext } from "../workspace-context.ts";

/**
 * Provides access to the currently edited {@link Material} and methods to safely modify it.
 */
export const [MaterialContextProvider, useMaterialContext] = createContextProvider(
    ({ value }: { value: Material }) => {
        const material = value;
        const appContext = useAppContext()!;
        const workspaceContext = useWorkspaceContext()!;
        const events = createEmitter<{
            added: DeepReadonly<MaterialNode>;
            removed: DeepReadonly<MaterialNode>;
            changed: DeepReadonly<MaterialNode>;
        }>();

        function setMaterial(mutator: (material: Material) => void) {
            workspaceContext.mutateMaterial(material.id, mutator);
        }

        setMaterial((material) => {
            material.nodes.forEach((node) => {
                node.spec = appContext.getNodeSpec(node.path);
                node.spec.parameters.forEach((info) => {
                    const hasValue = info.id in node.parameters;
                    if (!hasValue) {
                        node.parameters[info.id] = info.default;
                    }
                });
            });
        });

        return {
            /**
             * Instantiates a new node of given type and adds it to the material.
             *
             * @param typePath Type of the node to spawn (e.g. `@materialize/noise`)
             * @param x Initial position of the node on the X axis.
             * @param y Initial position of the node on the Y axis.
             */
            instantiateNode(typePath: string, x: number, y: number) {
                const spec = appContext.getNodeSpec(typePath);

                // Assign all parameters their default values.
                const parameters: MaterialNodeParametersMap = {};
                spec.parameters.forEach((parameter) => {
                    parameters[parameter.id] = parameter.default;
                });

                const id =
                    material.nodes.length === 0
                        ? 0
                        : Math.max(...material.nodes.map((x) => x.id)) + 1;
                const node: MaterialNode = {
                    id,
                    label: spec.name,
                    parameters: parameters,
                    x,
                    y,
                    path: typePath,
                    spec,
                    zIndex: id,
                };

                setMaterial((material) => {
                    material.nodes.push(node);
                    events.emit("added", node);
                });
            },

            /**
             * Moves given node by specified amount.
             *
             * @param id
             * @param x
             * @param y
             */
            moveNode(id: number, x: number, y: number) {
                setMaterial((material) => {
                    const node = material.nodes.find((x) => x.id === id);
                    if (!node) {
                        throw new Error(`Failed to move a node: Node does not exist.`);
                    }

                    node.x += x;
                    node.y += y;
                });
            },

            setNodeLabel(id: number, label: string) {
                setMaterial((material) => {
                    const node = material.nodes.find((x) => x.id === id);
                    if (!node) {
                        throw new Error(`Failed to change node label: Node does not exist.`);
                    }

                    node.label = label;
                });
            },

            setNodeParameter(id: number, parameterName: string, newValue: unknown) {
                setMaterial((material) => {
                    const node = material.nodes.find((x) => x.id === id);
                    if (!node) {
                        throw new Error(`Failed to change node parameter: Node does not exist.`);
                    }

                    node.parameters[parameterName] = newValue;

                    events.emit("changed", node);
                });
            },

            removeNode(id: number) {
                setMaterial((material) => {
                    const index = material.nodes.findIndex((node) => node.id === id);
                    if (index === -1) {
                        throw new Error("Failed to remove node: Node does not exist.");
                    }

                    const nodesToRefresh: Array<number> = [];

                    material.connections
                        .filter((connection) => {
                            return connection.from.nodeId === id || connection.to.nodeId === id;
                        })
                        .forEach((connection) => {
                            if (connection.from.nodeId === id) {
                                nodesToRefresh.push(connection.to.nodeId);
                            } else if (connection.to.nodeId === id) {
                                nodesToRefresh.push(connection.from.nodeId);
                            }

                            material.connections.splice(
                                material.connections.indexOf(connection),
                                1,
                            );
                        });

                    const node = material.nodes[index];

                    material.nodes.splice(index, 1);

                    events.emit("removed", node);

                    nodesToRefresh.forEach((id) => {
                        events.emit("changed", material.nodes.find((x) => x.id === id)!);
                    });
                });
            },

            /**
             * Adds a new connection between two sockets.
             * Existing connections to the destination socket will be removed.
             *
             * @param from
             * @param destination
             */
            addSocketConnection(from: MaterialNodeSocketAddr, destination: MaterialNodeSocketAddr) {
                setMaterial((material) => {
                    // Remove existing connections to the destination socket.
                    material.connections
                        .filter(
                            (x) =>
                                x.to.nodeId === destination.nodeId &&
                                x.to.socketId === destination.socketId,
                        )
                        .forEach((connection) => {
                            material.connections.splice(
                                material.connections.indexOf(connection),
                                1,
                            );
                        });

                    material.connections.push({
                        from,
                        to: destination,
                    });

                    events.emit("changed", material.nodes.find((x) => x.id === from.nodeId)!);
                    events.emit(
                        "changed",
                        material.nodes.find((x) => x.id === destination.nodeId)!,
                    );
                });
            },

            setName(name: string) {
                setMaterial((material) => {
                    material.name = name;
                });
            },

            getName: () => material.name,

            setOutputTextureFiltering(method: TextureFilterMethod) {
                setMaterial((material) => {
                    material.textureFiltering = method;
                });
            },

            getOutputTextureFiltering: () => material.textureFiltering,

            setOutputTextureSize(size: number) {
                setMaterial((material) => {
                    material.textureWidth = size;
                    material.textureHeight = size;
                });
            },

            getOutputTextureWidth: () => material.textureWidth,
            getOutputTextureHeight: () => material.textureHeight,
            getSocketConnections: () => material.connections,
            getMaterial: () => structuredClone(unwrap(material)),
            getNodes: () => material.nodes,
            getNodeById: (id: number) => material.nodes.find((x) => x.id === id),

            events,
        };
    },
);

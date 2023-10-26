import { createContextProvider } from "@solid-primitives/context";
import {
    Material,
    MaterialNode,
    MaterialNodeParametersMap,
    MaterialNodeSocketAddr,
} from "../types/material.ts";
import { createStore, produce } from "solid-js/store";
import { useAppContext } from "../app-context.ts";
import { createEmitter } from "@solid-primitives/event-bus";
import { DeepReadonly } from "ts-essentials";

/**
 * Provides access to the currently edited {@link Material} and methods to safely modify it.
 */
export const [MaterialContextProvider, useMaterialContext] = createContextProvider(
    ({ value }: { value: Material }) => {
        const appContext = useAppContext()!;
        const [material, setMaterial] = createStore(value);
        const events = createEmitter<{
            added: DeepReadonly<MaterialNode>;
            changed: DeepReadonly<MaterialNode>;
        }>();

        value.nodes.forEach((node) => {
            node.spec = appContext.getNodeSpec(node.path);
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

                const id = Math.max(...material.nodes.map((x) => x.id)) + 1;
                const node: MaterialNode = {
                    id,
                    label: typePath,
                    parameters: parameters,
                    x,
                    y,
                    path: typePath,
                    spec,
                    zIndex: id,
                };

                setMaterial(
                    produce((material) => {
                        material.nodes.push(node);
                        events.emit("added", node);
                    }),
                );
            },

            /**
             * Moves given node by specified amount.
             *
             * @param id
             * @param x
             * @param y
             */
            moveNode(id: number, x: number, y: number) {
                setMaterial(
                    produce((material) => {
                        const node = material.nodes.find((x) => x.id === id);
                        if (!node) {
                            throw new Error(`Failed to move a node: Node does not exist.`);
                        }

                        node.x += x;
                        node.y += y;
                    }),
                );
            },

            setNodeParameter(id: number, parameterName: string, newValue: unknown) {
                setMaterial(
                    produce((material) => {
                        const node = material.nodes.find((x) => x.id === id);
                        if (!node) {
                            throw new Error(
                                `Failed to change node parameter: Node does not exist.`,
                            );
                        }

                        node.parameters[parameterName] = newValue;

                        events.emit("changed", node);
                    }),
                );
            },

            /**
             * Adds a new connection between two sockets.
             * Existing connections to the destination socket will be removed.
             *
             * @param from
             * @param destination
             */
            addSocketConnection(from: MaterialNodeSocketAddr, destination: MaterialNodeSocketAddr) {
                setMaterial(
                    produce((material) => {
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
                    }),
                );
            },

            getNodes: () => material.nodes,
            getNodeById: (id: number) => material.nodes.find((x) => x.id === id),

            getOutputTextureWidth: () => material.textureWidth,
            getOutputTextureHeight: () => material.textureHeight,
            getSocketConnections: () => material.connections,

            events,
        };
    },
);

import { createContextProvider } from "@solid-primitives/context";
import {
    Material,
    MaterialNode,
    MaterialNodeSocketAddr,
} from "../types/material.ts";
import { createSignal } from "solid-js";
import { useEditorDiagnosticsContext } from "./diagnostics-context.ts";

type Props = {
    material: Material;
};

const [EditorMaterialContextProvider, useEditorMaterialContext] =
    createContextProvider(({ value }: { value: Props }) => {
        const diagnostics = useEditorDiagnosticsContext()!;
        const [material, setMaterial] = createSignal(value.material);

        return {
            addNode(node: MaterialNode) {
                setMaterial((material) => {
                    const newMaterial = { ...material };
                    newMaterial.nodes.push(node);
                    return newMaterial;
                });
            },

            /**
             * Changes position of specified node by a certain amount.
             *
             * @param id
             * @param x
             * @param y
             */
            translateNode(id: number, x: number, y: number) {
                setMaterial((material) => {
                    const newMaterial = { ...material };
                    const node = newMaterial.nodes.find((x) => x.id === id);
                    if (node) {
                        node.x += x;
                        node.y += y;
                    } else {
                        diagnostics.error(
                            `Attempted to move node #${id}, but it was not found.`,
                        );
                    }
                    return newMaterial;
                });
            },

            setNodeParameter(
                id: number,
                parameterName: string,
                newValue: unknown,
            ) {
                setMaterial((material) => {
                    const newMaterial = { ...material };
                    const node = newMaterial.nodes.find((x) => x.id === id);
                    if (node) {
                        node.parameters[parameterName] = newValue;
                    }
                    return newMaterial;
                });
            },

            /**
             * Adds a new connection between two node sockets.
             * Automatically resolves conflicts.
             *
             * @param from
             * @param to
             */
            addConnection(
                from: MaterialNodeSocketAddr,
                to: MaterialNodeSocketAddr,
            ) {
                setMaterial((material) => {
                    const updatedMaterial = { ...material };

                    const existingConnections =
                        updatedMaterial.connections.filter(
                            (x) =>
                                x.to.nodeId === to.nodeId &&
                                x.to.socketId === to.socketId,
                        );
                    for (const existingConnection of existingConnections) {
                        updatedMaterial.connections.splice(
                            updatedMaterial.connections.indexOf(
                                existingConnection,
                            ),
                            1,
                        );
                    }
                    updatedMaterial.connections.push({
                        from,
                        to,
                    });
                    return updatedMaterial;
                });
            },

            getNodes() {
                return material().nodes;
            },

            getNodeById(id: number) {
                return material().nodes.find((x) => x.id === id);
            },

            getOutputTextureWidth() {
                return material().textureWidth;
            },

            getOutputTextureHeight() {
                return material().textureHeight;
            },

            getMaterial() {
                return material;
            },
        };
    });

export { EditorMaterialContextProvider, useEditorMaterialContext };

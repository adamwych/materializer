import { createContextProvider } from "@solid-primitives/context";
import { createSignal } from "solid-js";
import { useMaterialStore } from "../../../../stores/material";
import makeDragListener from "../../../../utils/makeDragListener";
import { Point2D } from "../../../../utils/math";
import { useEditorAddNodePopupRef } from "../../add-node-popup/ref";
import { useEditorRuntimeCache } from "../cache";
import { useEditorCameraState } from "./camera";

export type PendingConnectionInfo = {
    fromNodeId: number;
    fromSocketId: string;
    fromCoords: Point2D;
    pointerCoords: Point2D;
};

/**
 * Connection builder facilitates the action of building of a connection between two sockets.
 */
export const [EditorConnectionBuilder, useEditorConnectionBuilder] = createContextProvider(() => {
    const runtimeCache = useEditorRuntimeCache()!;
    const cameraState = useEditorCameraState()!;
    const materialStore = useMaterialStore()!;
    const addNodePopupRef = useEditorAddNodePopupRef()!;
    const [info, setInfo] = createSignal<PendingConnectionInfo>();
    let clearDragListener: VoidFunction;

    return {
        begin(ev: PointerEvent, nodeId: number, socketId: string) {
            ev.stopPropagation();

            const node = materialStore.getNodeById(nodeId)!;

            const nodeInputs = materialStore.getInputsMap(node);
            const beganOnInputSocket = nodeInputs.has(socketId);
            if (beganOnInputSocket) {
                const connection = nodeInputs.get(socketId)!;
                const startNode = materialStore.getNodeById(connection[0])!;
                const socketElement = runtimeCache.getNodeSocketDOMElement(
                    connection[0],
                    connection[1],
                )!;
                setInfo({
                    fromNodeId: connection[0],
                    fromSocketId: connection[1],
                    fromCoords: {
                        x: startNode.x + socketElement.offsetLeft + socketElement.clientWidth / 2,
                        y: startNode.y + socketElement.offsetTop + socketElement.clientHeight / 2,
                    },
                    pointerCoords: cameraState.mapCoordsToGraphSpace(ev.pageX, ev.pageY),
                });

                materialStore.removeEdge({ from: connection, to: [nodeId, socketId] });
            } else {
                const socketElement = runtimeCache.getNodeSocketDOMElement(nodeId, socketId)!;
                setInfo({
                    fromNodeId: nodeId,
                    fromSocketId: socketId,
                    fromCoords: {
                        x: node.x + socketElement.offsetLeft + socketElement.clientWidth / 2,
                        y: node.y + socketElement.offsetTop + socketElement.clientHeight / 2,
                    },
                    pointerCoords: cameraState.mapCoordsToGraphSpace(ev.pageX, ev.pageY),
                });
            }

            clearDragListener = makeDragListener(
                (ev) => {
                    setInfo((info) => ({
                        ...info!,
                        pointerCoords: cameraState.mapCoordsToGraphSpace(ev.pageX, ev.pageY),
                    }));
                },
                (ev) => {
                    // Handle case when the user started building a connection, but did not
                    // release the pointer on a socket element.
                    // If pointer was released on a socket, the event would not propagate here.
                    addNodePopupRef.show(ev.pageX, ev.pageY).then((result) => {
                        if (result) {
                            const resultNodeBlueprint = materialStore.getNodeBlueprint(result.id)!;
                            const resultNodeInputSockets = Object.keys(resultNodeBlueprint.inputs);
                            if (resultNodeInputSockets.length > 0) {
                                materialStore.addEdge({
                                    from: [info()!.fromNodeId, info()!.fromSocketId],
                                    to: [result.id, resultNodeInputSockets[0]],
                                });
                            }
                        }

                        setInfo(undefined);
                    });
                },
            );
        },

        end(ev: PointerEvent, nodeId: number, socketId: string) {
            if (info()) {
                ev.stopPropagation();
                materialStore.addEdge({
                    from: [info()!.fromNodeId, info()!.fromSocketId],
                    to: [nodeId, socketId],
                });
                clearDragListener();
                setInfo(undefined);
            }
        },

        info,
    };
});

export type IEditorConnectionBuilder = NonNullable<ReturnType<typeof useEditorConnectionBuilder>>;

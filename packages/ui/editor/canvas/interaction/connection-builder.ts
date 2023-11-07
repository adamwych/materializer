import { createContextProvider } from "@solid-primitives/context";
import { createSignal } from "solid-js";
import { useEditorCameraState } from "./camera";
import { useEditorRuntimeCache } from "../cache";
import { useMaterialStore } from "../../../../stores/material";
import { Point2D } from "../../../../utils/math";
import makeDragListener from "../../../../utils/makeDragListener";

export type PendingConnectionInfo = {
    nodeId: number;
    socketId: string;
    from: Point2D;
    to: Point2D;
};

/**
 * Connection builder facilitates the action of building of a connection between two sockets.
 */
export const [EditorConnectionBuilder, useEditorConnectionBuilder] = createContextProvider(() => {
    const runtimeCache = useEditorRuntimeCache()!;
    const cameraState = useEditorCameraState()!;
    const materialActions = useMaterialStore()!;
    const [info, setInfo] = createSignal<PendingConnectionInfo>();
    let clearDragListener: VoidFunction;

    return {
        begin(ev: PointerEvent, nodeId: number, socketId: string) {
            ev.stopPropagation();

            const node = materialActions.getNodeById(nodeId)!;
            const socketElement = runtimeCache.getNodeSocketDOMElement(nodeId, socketId)!;

            setInfo({
                nodeId,
                socketId,
                from: {
                    x: node.x + socketElement.offsetLeft + socketElement.clientWidth / 2,
                    y: node.y + socketElement.offsetTop + socketElement.clientHeight / 2,
                },
                to: cameraState.mapCoordsToGraphSpace(ev.pageX, ev.pageY),
            });

            clearDragListener = makeDragListener(
                (ev) => {
                    setInfo((info) => ({
                        ...info!,
                        to: cameraState.mapCoordsToGraphSpace(ev.pageX, ev.pageY),
                    }));
                },
                () => {
                    setInfo(undefined);
                },
            );
        },

        end(ev: PointerEvent, nodeId: number, socketId: string) {
            if (info()) {
                ev.stopPropagation();
                materialActions.addConnection(info()!.nodeId, info()!.socketId, nodeId, socketId);
                clearDragListener();
                setInfo(undefined);
            }
        },

        info,
    };
});

export type IEditorConnectionBuilder = NonNullable<ReturnType<typeof useEditorConnectionBuilder>>;

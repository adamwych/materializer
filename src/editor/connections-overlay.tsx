import { useEditorContext } from "./editor-context.ts";
import { For } from "solid-js";
import MaterialGraphNodeConnectionCurve from "./connection-curve.tsx";
import { useMaterialContext } from "./material-context.ts";

export default function MaterialGraphEditorConnectionsOverlay() {
    const editorCtx = useEditorContext()!;
    const materialCtx = useMaterialContext()!;

    function ConnectionLine({
        fromNodeId,
        fromSocketId,
        toNodeId,
        toSocketId,
    }: {
        fromNodeId: number;
        fromSocketId: string;
        toNodeId: number;
        toSocketId: string;
    }) {
        const menuBarHeight = 70;
        const fromCoords = () => {
            // Update fromCoords whenever X or Y of the node change.
            const node = materialCtx.getNodeById(fromNodeId);
            node?.x;
            node?.y;

            const element = editorCtx.getNodeSocketElement(fromNodeId, fromSocketId);
            if (element) {
                const rect = element.getBoundingClientRect();
                return [rect.x + 8, rect.y + 8 - menuBarHeight];
            }
            return [0, 0];
        };

        const toCoords = () => {
            // Update toCoords whenever X or Y of the node change.
            const node = materialCtx.getNodeById(toNodeId);
            node?.x;
            node?.y;

            const element = editorCtx.getNodeSocketElement(toNodeId, toSocketId);
            if (element) {
                const rect = element.getBoundingClientRect();
                return [rect.x + 8, rect.y + 8 - menuBarHeight];
            }
            return [0, 0];
        };

        return (
            <MaterialGraphNodeConnectionCurve
                fromCoords={fromCoords() as [number, number]}
                toCoords={toCoords() as [number, number]}
            />
        );
    }

    return (
        <svg width="100%" height="100%" viewBox="0 0 100% 100%">
            <For each={materialCtx.getSocketConnections()}>
                {(connection) => (
                    <ConnectionLine
                        fromNodeId={connection.from.nodeId}
                        fromSocketId={connection.from.socketId}
                        toNodeId={connection.to.nodeId}
                        toSocketId={connection.to.socketId}
                    />
                )}
            </For>
        </svg>
    );
}

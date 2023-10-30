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
        const fromCoords = () => {
            // Update fromCoords whenever X or Y of the node change.
            const node = materialCtx.getNodeById(fromNodeId);
            node?.x;
            node?.y;

            const nodeElement = editorCtx.getNodeElement(fromNodeId);
            const element = editorCtx.getNodeSocketElement(fromNodeId, fromSocketId);
            if (nodeElement && element) {
                const top = nodeElement.offsetTop + element.offsetTop;
                const left = nodeElement.offsetLeft + element.offsetLeft;
                return [left + 8, top + 8];
            }
            return [0, 0];
        };

        const toCoords = () => {
            // Update toCoords whenever X or Y of the node change.
            const node = materialCtx.getNodeById(toNodeId);
            node?.x;
            node?.y;

            const nodeElement = editorCtx.getNodeElement(toNodeId);
            const element = editorCtx.getNodeSocketElement(toNodeId, toSocketId);
            if (nodeElement && element) {
                const top = nodeElement.offsetTop + element.offsetTop;
                const left = nodeElement.offsetLeft + element.offsetLeft;
                return [left + 8, top + 8];
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
        <svg
            width="100%"
            height="100%"
            viewBox="0 0 100% 100%"
            class="absolute pointer-events-none"
        >
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

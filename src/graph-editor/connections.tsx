import { useEditorRuntimeContext } from "./runtime-context.tsx";
import { For } from "solid-js";
import UIMaterialGraphNodeConnectionCurve from "./connection-curve.tsx";
import { useEditorMaterialContext } from "./material-context.ts";

export default function MaterialGraphEditorConnectionsOverlay() {
    const editorCtx = useEditorRuntimeContext();
    const material = useEditorMaterialContext()!.getMaterial();

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
            material(); // FIXME: This makes it reactive to any property of material.
            const element = editorCtx.getNodeSocketElement(
                fromNodeId,
                fromSocketId,
            );
            if (element) {
                const rect = element.getBoundingClientRect();
                return [rect.x + 8, rect.y + 8 - menuBarHeight];
            }
            return [0, 0];
        };

        const toCoords = () => {
            material(); // FIXME: This makes it reactive to any property of material.
            const element = editorCtx.getNodeSocketElement(
                toNodeId,
                toSocketId,
            );
            if (element) {
                const rect = element.getBoundingClientRect();
                return [rect.x + 8, rect.y + 8 - menuBarHeight];
            }
            return [0, 0];
        };

        return (
            <UIMaterialGraphNodeConnectionCurve
                fromCoords={fromCoords() as [number, number]}
                toCoords={toCoords() as [number, number]}
            />
        );
    }

    return (
        <svg width="100%" height="100%" viewBox="0 0 100% 100%">
            <For each={material().connections}>
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

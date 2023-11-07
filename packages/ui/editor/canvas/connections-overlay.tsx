import { For } from "solid-js";
import { useWorkspaceStore } from "../../../stores/workspace";
import { EDITOR_GRAPH_HEIGHT, EDITOR_GRAPH_WIDTH } from "../consts";
import EditorCanvasConnectionCurve from "./connection-curve";
import { useEditorRuntimeCache } from "./cache";

export default function EditorCanvasConnectionsOverlay() {
    const workspace = useWorkspaceStore()!;
    const runtimeCache = useEditorRuntimeCache()!;
    const material = () => workspace.getActiveMaterial()!;

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
            const node = material().nodes.get(fromNodeId)!;
            const element = runtimeCache.getNodeSocketDOMElement(fromNodeId, fromSocketId);
            if (element) {
                const top = node.y + element.offsetTop;
                const left = node.x + element.offsetLeft;
                return [left + 8, top + 8];
            }
            return [0, 0];
        };

        const toCoords = () => {
            const node = material().nodes.get(toNodeId)!;
            const element = runtimeCache.getNodeSocketDOMElement(toNodeId, toSocketId);
            if (element) {
                const top = node.y + element.offsetTop;
                const left = node.x + element.offsetLeft;
                return [left + 8, top + 8];
            }
            return [0, 0];
        };

        return (
            <EditorCanvasConnectionCurve
                fromCoords={fromCoords() as [number, number]}
                toCoords={toCoords() as [number, number]}
            />
        );
    }

    return (
        <svg
            width={EDITOR_GRAPH_WIDTH + "px"}
            height={EDITOR_GRAPH_HEIGHT + "px"}
            viewBox={`0 0 ${EDITOR_GRAPH_WIDTH}px ${EDITOR_GRAPH_HEIGHT}px`}
            class="absolute pointer-events-none"
        >
            <For each={material().connections}>
                {(connection) => (
                    <ConnectionLine
                        fromNodeId={connection.from[0]}
                        fromSocketId={connection.from[1]}
                        toNodeId={connection.to[0]}
                        toSocketId={connection.to[1]}
                    />
                )}
            </For>
        </svg>
    );
}

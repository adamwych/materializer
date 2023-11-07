import { For } from "solid-js";
import { useWorkspaceStore } from "../../../stores/workspace";
import EditorCanvasNodeBox from "./node-box";

export default function EditorCanvasNodes() {
    const material = useWorkspaceStore()!.getActiveMaterial()!;

    return (
        <div class="absolute pointer-events-none">
            <For each={Object.values(material.nodes)}>
                {(node) => <EditorCanvasNodeBox node={node} />}
            </For>
        </div>
    );
}

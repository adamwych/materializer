import Dialog from "./components/dialog/dialog.tsx";
import { MaterialNode } from "./types/material.ts";
import { createSignal, For } from "solid-js";
import { useWorkspaceContext } from "./workspace-context.ts";

interface Props {
    onClose(): void;
}

export default function ExportDialog(props: Props) {
    const context = useWorkspaceContext()!;
    const activeMaterial = context.activeEditorTabMaterial;
    const outputNodes = () => activeMaterial().nodes;
    const [_selectedOutputNodes, setSelectedOutputNodes] = createSignal<Array<number>>([]);

    function toggleOutputNode(node: MaterialNode) {
        setSelectedOutputNodes((nodes) => {
            const newNodes = [...nodes];
            const index = newNodes.indexOf(node.id);
            if (index > -1) {
                newNodes.splice(index, 1);
            } else {
                newNodes.push(node.id);
            }

            return newNodes;
        });
    }

    function doExport() {}

    return (
        <Dialog
            title={`Exporting ${activeMaterial().name}`}
            buttons={[
                {
                    label: "Export",
                    onClick: doExport,
                },
                {
                    label: "Cancel",
                    onClick: props.onClose,
                },
            ]}
        >
            <div>Select output nodes to export:</div>
            <For each={outputNodes()}>
                {(node) => (
                    <div>
                        <input type="checkbox" onChange={() => toggleOutputNode(node)} />
                        {node.label}
                    </div>
                )}
            </For>
        </Dialog>
    );
}

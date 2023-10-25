import UIDialog from "./components/dialog/dialog.tsx";
import { useAppContext } from "./app-context.ts";
import { MaterialNode, MaterialNodeType } from "./types/material.ts";
import { createSignal, For } from "solid-js";
import RenderingScheduler from "./renderer/scheduler.ts";
import RenderingEngine from "./renderer/engine.ts";
import { unwrap } from "solid-js/store";
import saveBlobToFile from "./utils/saveBlobToFile.ts";

interface Props {
    onClose(): void;
}

export default function UIExportDialog(props: Props) {
    const context = useAppContext()!;
    const activeMaterial = context.activeEditorTabMaterial;
    const outputNodes = () =>
        activeMaterial().nodes.filter(
            (x) => x.type === MaterialNodeType.Output,
        );
    const [selectedOutputNodes, setSelectedOutputNodes] = createSignal<
        Array<number>
    >([]);

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

    function doExport() {
        const material = activeMaterial();
        const runtimeContext = context.getRuntimeContext(material)!;

        const ids = selectedOutputNodes();
        const nodes = outputNodes().filter((node) => ids.includes(node.id));

        const exportedNodes: Array<number> = [];
        const engine = new RenderingEngine(
            material.textureWidth,
            material.textureHeight,
        );

        const scheduler = new RenderingScheduler(engine);

        for (const node of nodes) {
            const results = scheduler.scheduleChain(
                unwrap(material),
                unwrap(node),
                (id) => material.nodes.find((x) => x.id === id)!,
                (id) => runtimeContext.getNodeInfo(id)()!,
            );

            for (const result of results) {
                if (result.nodeId === node.id) {
                    result.then((outputs: any) => {
                        if (exportedNodes.includes(node.id)) {
                            return;
                        }

                        exportedNodes.push(node.id);

                        for (const { bitmap } of outputs.values()) {
                            const canvas = new OffscreenCanvas(
                                material.textureWidth,
                                material.textureHeight,
                            );
                            const canvasContext =
                                canvas.getContext("bitmaprenderer")!;
                            canvasContext.transferFromImageBitmap(bitmap);
                            canvas.convertToBlob().then((blob) => {
                                saveBlobToFile("test.png", blob);
                            });
                        }
                    });
                }
            }
        }

        scheduler.runOnce();
    }

    return (
        <UIDialog
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
                        <input
                            type="checkbox"
                            onChange={() => toggleOutputNode(node)}
                        />
                        {node.label}
                    </div>
                )}
            </For>
        </UIDialog>
    );
}

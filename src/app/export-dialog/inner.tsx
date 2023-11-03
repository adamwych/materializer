import { ReactiveMap } from "@solid-primitives/map";
import { ReactiveSet } from "@solid-primitives/set";
import { For, createSignal } from "solid-js";
import Dialog from "../../components/dialog/dialog.tsx";
import SelectOption from "../../components/select/select-option.tsx";
import Select from "../../components/select/select.tsx";
import HorizontalSlider from "../../components/slider/horizontal-slider.tsx";
import { useRenderingEngine } from "../../renderer/engine.ts";
import { useRenderingScheduler } from "../../renderer/scheduler.ts";
import saveBlobToFile from "../../utils/saveBlobToFile.ts";
import { useWorkspaceContext } from "../../workspace-context.ts";
import {
    ExportFileFormat,
    getExportFileExtension,
    getExportFileMimeType,
    getExportFileName,
} from "./format.ts";
import ExportDialogOutputNodesPanel from "./output-nodes.tsx";
import ExportDialogParameter from "./parameter.tsx";

interface Props {
    onClose(): void;
}

export default function ExportDialogInner(props: Props) {
    const context = useWorkspaceContext()!;
    const renderer = useRenderingEngine()!;
    const scheduler = useRenderingScheduler()!;
    const activeMaterial = context.activeEditorTabMaterial;
    const [fileFormat, setFileFormat] = createSignal(ExportFileFormat.Png);
    const [textureSize, setTextureSize] = createSignal(activeMaterial()!.textureWidth);
    const selectedNodes = new ReactiveSet<number>();
    const fileNames = new ReactiveMap<number, string>();

    async function exportSelectedNodes() {
        const material = activeMaterial()!;
        const outputSize = textureSize();
        const outputNodes = material.nodes.filter((node) => selectedNodes.has(node.id));

        // Initialize renderer and schedule a render of each output node.
        {
            renderer.setNodeTextureSize(outputSize, outputSize);
            renderer.setOutputTextureSize(outputSize, outputSize);
            renderer.initializeCanvas(new OffscreenCanvas(outputSize, outputSize));

            outputNodes.forEach((node) => {
                scheduler.scheduleChain(node);
            });

            // Run render jobs and wait for all nodes to be rendered.
            await scheduler.runOnce();
        }

        const mimeType = getExportFileMimeType(fileFormat());
        const extension = getExportFileExtension(fileFormat());
        const canvas = new OffscreenCanvas(outputSize, outputSize);
        const context = canvas.getContext("bitmaprenderer")!;

        // Render each output node's bitmap to a canvas, convert
        // that canvas to a Blob and then finally save that Blob as a file.
        outputNodes.forEach((node) => {
            const outputSocket = node.spec!.outputSockets[0];
            const bitmap = renderer.getNodeBitmap(node.id, outputSocket.id)()?.bitmap;
            if (!bitmap) {
                console.error(
                    `No image was rendered for node ${node.label}. This is most probably a bug.`,
                );
                return;
            }

            context.transferFromImageBitmap(bitmap);
            canvas
                .convertToBlob({
                    type: mimeType,
                })
                .then((blob) => {
                    const fileName = fileNames.get(node.id) + "." + extension;
                    saveBlobToFile(fileName, blob);
                });
        });
    }

    return (
        <Dialog
            title={`Exporting "${activeMaterial()!.name}"`}
            buttons={[
                {
                    label: "Export",
                    disabled: selectedNodes.size == 0,
                    onClick: exportSelectedNodes,
                },
                {
                    label: "Cancel",
                    onClick: props.onClose,
                },
            ]}
            onClose={props.onClose}
        >
            <div class="flex flex-col gap-4">
                <ExportDialogParameter
                    label="Texture size"
                    description="This allows you to override material's texture size for this export. In other words, you can work in low-res and then export in high-res."
                    inline
                >
                    <div class="w-full flex items-center gap-2">
                        <HorizontalSlider
                            value={textureSize()}
                            min={32}
                            max={2048}
                            step={32}
                            onChange={setTextureSize}
                        />
                        <div class="text-sm w-[96px] text-center">
                            {textureSize()}x{textureSize()}
                        </div>
                    </div>
                </ExportDialogParameter>

                <ExportDialogParameter label="Format" description="Format of output images." inline>
                    <Select
                        label={getExportFileName(fileFormat())}
                        value={fileFormat()}
                        onChange={setFileFormat}
                    >
                        <For each={Object.values(ExportFileFormat)}>
                            {(format) => (
                                <SelectOption value={format}>
                                    {getExportFileName(format)}
                                </SelectOption>
                            )}
                        </For>
                    </Select>
                </ExportDialogParameter>

                <ExportDialogParameter
                    label="Output nodes"
                    description="Select which output nodes you want to export and set their file names."
                >
                    <ExportDialogOutputNodesPanel
                        material={activeMaterial()!}
                        fileNames={fileNames}
                        selectedNodes={selectedNodes}
                        fileFormat={fileFormat()}
                    />
                </ExportDialogParameter>
            </div>
        </Dialog>
    );
}

import { ReactiveMap } from "@solid-primitives/map";
import { ReactiveSet } from "@solid-primitives/set";
import { createSignal, For } from "solid-js";
import { useRenderEngine } from "../../renderer/engine.ts";
import { useMaterialStore } from "../../stores/material.ts";
import saveBlobToFile from "../../utils/saveBlobToFile.ts";
import Dialog from "../components/dialog/dialog.tsx";
import SelectOption from "../components/select/option.tsx";
import Select from "../components/select/select.tsx";
import HorizontalSlider from "../components/slider/horizontalSlider.tsx";
import {
    ExportFileFormat,
    getExportFileExtension,
    getExportFileMimeType,
    getExportFileName,
} from "./format.ts";
import ExportDialogOutputNodesPanel from "./output-nodes.tsx";
import ExportDialogParameter from "./parameter.tsx";
import { useDialogsStore } from "../components/dialog/store.ts";
import Button from "../components/button/button.tsx";

export default function ExportDialogInner() {
    const renderer = useRenderEngine()!;
    const selectedNodes = new ReactiveSet<number>();
    const fileNames = new ReactiveMap<number, string>();
    const [fileFormat, setFileFormat] = createSignal(ExportFileFormat.Png);
    const [textureSize, setTextureSize] = createSignal(0);
    const [exportProgress, setExportProgress] = createSignal(0);
    const [isExporting, setExporting] = createSignal(false);
    const materialStore = useMaterialStore()!;
    const material = () => materialStore.getMaterial();
    const dialogs = useDialogsStore()!;

    async function exportSelectedNodes() {
        setExporting(true);
        setExportProgress(0);

        const outputSize = textureSize();
        const outputNodes = Object.values(material().nodes).filter((node) =>
            selectedNodes.has(node.id),
        );

        let outputBitmaps = new Map<number, Map<string, ImageData>>();

        // Initialize renderer and schedule a render of each output node.
        {
            // renderer.initialize(new OffscreenCanvas(outputSize, outputSize), {
            //     nodes: Object.values(material().nodes).map(
            //         materialStore.makeNodeRenderableSnapshot,
            //     ),
            // });
            // outputNodes.forEach((node) => {
            //     scheduler.scheduleChain(node);
            // });
            // // Run render jobs and wait for all nodes to be rendered.
            // outputBitmaps = await scheduler.runOnce((progress) => {
            //     setExportProgress(progress.finishedJobs / progress.totalJobs);
            // });
        }

        const mimeType = getExportFileMimeType(fileFormat());
        const extension = getExportFileExtension(fileFormat());

        // Render each output node's bitmap to a canvas, convert
        // that canvas to a Blob and then finally save that Blob as a file.
        outputNodes.forEach((node) => {
            const bitmap = outputBitmaps.get(node.id)?.get("colorOut");
            if (!bitmap) {
                console.error(
                    `No image was rendered for node ${node.name}. This is most probably a bug.`,
                );
                return;
            }

            const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
            const context = canvas.getContext("2d")!;
            context.putImageData(bitmap, 0, 0);
            canvas
                .convertToBlob({
                    type: mimeType,
                })
                .then((blob) => {
                    const fileName = fileNames.get(node.id) + "." + extension;
                    saveBlobToFile(fileName, blob);
                });
        });

        setExporting(false);
    }

    return (
        <Dialog
            title={`Exporting "${material().name}"`}
            buttons={[
                <Button
                    disabled={isExporting() ? true : selectedNodes.size == 0}
                    onClick={exportSelectedNodes}
                >
                    {isExporting() ? Math.round(exportProgress() * 100) + "%" : "Export"}
                </Button>,
                <Button onClick={() => dialogs.pop()}>Cancel</Button>,
            ]}
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
                        material={material()}
                        fileNames={fileNames}
                        selectedNodes={selectedNodes}
                        fileFormat={fileFormat()}
                    />
                </ExportDialogParameter>
            </div>
        </Dialog>
    );
}

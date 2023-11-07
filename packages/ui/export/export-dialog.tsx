import { ReactiveMap } from "@solid-primitives/map";
import { ReactiveSet } from "@solid-primitives/set";
import { createSignal, For } from "solid-js";
import { RenderEngineProvider, useRenderEngine } from "../../renderer/engine.ts";
import { MaterialProvider, useMaterialStore } from "../../stores/material.ts";
import saveBlobToFile from "../../utils/saveBlobToFile.ts";
import Button from "../components/button/button.tsx";
import Dialog from "../components/dialog/dialog.tsx";
import { useDialogsStore } from "../components/dialog/store.ts";
import SelectOption from "../components/select/option.tsx";
import Select from "../components/select/select.tsx";
import {
    ExportImageFormat,
    getExportImageFileExtension,
    getExportImageFormatMimeType,
    getExportImageFormatName,
} from "./format.ts";
import ExportDialogOutputNodesPanel from "./output-nodes.tsx";
import ExportDialogParameter from "./parameter.tsx";

export default function ExportDialog() {
    return (
        <MaterialProvider>
            <RenderEngineProvider>
                <ExportDialogInner />
            </RenderEngineProvider>
        </MaterialProvider>
    );
}

function ExportDialogInner() {
    const renderer = useRenderEngine()!;
    const materialStore = useMaterialStore()!;
    const dialogs = useDialogsStore()!;
    const selectedNodes = new ReactiveSet<number>();
    const fileNames = new ReactiveMap<number, string>();
    const [fileFormat, setFileFormat] = createSignal(ExportImageFormat.Png);
    const [exportProgress, setExportProgress] = createSignal(0);
    const [isExporting, setExporting] = createSignal(false);
    const material = () => materialStore.getMaterial();

    async function exportSelectedNodes() {
        setExporting(true);
        setExportProgress(0);

        renderer.initializeWebGLWorker(new OffscreenCanvas(1, 1), material(), false);

        const mimeType = getExportImageFormatMimeType(fileFormat());
        const extension = getExportImageFileExtension(fileFormat());
        let numberOfRenderedNodes = 0;

        for (const nodeId of selectedNodes) {
            // Render node and get its pixels data from the worker.
            const imageData = await renderer.renderAndGetImage(nodeId);

            // Render image data to a canvas and retrieve it as a Blob.
            const canvas = new OffscreenCanvas(imageData.width, imageData.height);
            const context = canvas.getContext("2d")!;
            context.putImageData(imageData, 0, 0);
            const blob = await canvas.convertToBlob({
                type: mimeType,
            });

            // Save the image.
            const fileName = fileNames.get(nodeId) + "." + extension;
            saveBlobToFile(fileName, blob);

            setExportProgress((++numberOfRenderedNodes / selectedNodes.size) * 100);
        }

        renderer.terminateWorker();

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
                <ExportDialogParameter label="Format" description="Format of output images." inline>
                    <Select
                        label={getExportImageFormatName(fileFormat())}
                        value={fileFormat()}
                        onChange={setFileFormat}
                    >
                        <For each={Object.values(ExportImageFormat)}>
                            {(format) => (
                                <SelectOption value={format}>
                                    {getExportImageFormatName(format)}
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

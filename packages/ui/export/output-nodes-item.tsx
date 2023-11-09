import { ReactiveMap } from "@solid-primitives/map";
import { ReactiveSet } from "@solid-primitives/set";
import { Material } from "../../types/material.ts";
import { MaterialNode } from "../../types/node.ts";
import Checkbox from "../components/input/checkbox.tsx";
import TextInput from "../components/input/text-input.tsx";
import HorizontalSlider from "../components/slider/horizontalSlider.tsx";
import { ExportImageFormat, getExportImageFileExtension } from "./format.ts";

type Props = {
    material: Material;
    node: MaterialNode;
    fileNames: ReactiveMap<number, string>;
    outputSizes: ReactiveMap<number, number>;
    fileFormat: ExportImageFormat;
    selectedNodes: ReactiveSet<number>;
};

export default function ExportDialogOutputNodesItem(props: Props) {
    const isSelected = () => props.selectedNodes.has(props.node.id);
    const outputSize = () => props.outputSizes.get(props.node.id) ?? 0;

    function setSelected(selected: boolean) {
        if (selected) {
            props.selectedNodes.add(props.node.id);
        } else {
            props.selectedNodes.delete(props.node.id);
        }
    }

    return (
        <div
            class="gap-3 items-center"
            style={{
                display: "grid",
                "grid-template-columns": "22px 1fr 1fr auto",
            }}
        >
            <Checkbox value={isSelected()} onChange={setSelected} />

            <div>
                <div class="text-sm">{props.node.name}</div>
                <div class="flex items-center" classList={{ "opacity-50": !isSelected() }}>
                    <div class="text-xs text-gray-800 w-[90px]">
                        {outputSize()}x{outputSize()}
                    </div>

                    <HorizontalSlider
                        min={32}
                        max={2048}
                        step={32}
                        disabled={!isSelected()}
                        value={outputSize()}
                        onChange={(v) => props.outputSizes.set(props.node.id, v)}
                    />
                </div>
            </div>

            <TextInput
                value={props.fileNames.get(props.node.id) ?? ""}
                readOnly={!isSelected()}
                onChange={(value) => props.fileNames.set(props.node.id, value)}
            />
            <div class="text-sm">.{getExportImageFileExtension(props.fileFormat)}</div>
        </div>
    );
}

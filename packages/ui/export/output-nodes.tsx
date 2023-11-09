import { ReactiveMap } from "@solid-primitives/map";
import { ReactiveSet } from "@solid-primitives/set";
import { For, Show } from "solid-js";
import { Material } from "../../types/material.ts";
import { ExportImageFormat } from "./format.ts";
import ExportDialogOutputNodesItem from "./output-nodes-item.tsx";

type Props = {
    material: Material;
    fileNames: ReactiveMap<number, string>;
    outputSizes: ReactiveMap<number, number>;
    selectedNodes: ReactiveSet<number>;
    fileFormat: ExportImageFormat;
};

export default function ExportDialogOutputNodesPanel(props: Props) {
    const allOutputNodes = () =>
        Array.from(props.material.nodes.values()).filter((x) => x.path === "materializer/output");

    return (
        <div class="flex flex-col gap-2 mt-2">
            <Show when={allOutputNodes().length === 0}>
                <div class="text-sm mt-1 text-washed-red-900">
                    Active material does not have any output nodes.
                </div>
            </Show>

            <For each={allOutputNodes()}>
                {(node) => (
                    <ExportDialogOutputNodesItem
                        material={props.material}
                        node={node}
                        fileNames={props.fileNames}
                        outputSizes={props.outputSizes}
                        fileFormat={props.fileFormat}
                        selectedNodes={props.selectedNodes}
                    />
                )}
            </For>
        </div>
    );
}

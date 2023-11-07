import { ReactiveMap } from "@solid-primitives/map";
import { ReactiveSet } from "@solid-primitives/set";
import { RiSystemCheckFill } from "solid-icons/ri";
import { For, Show } from "solid-js";
import { Material } from "../../types/material.ts";
import { MaterialNode } from "../../types/node.ts";
import TextInput from "../components/input/text-input.tsx";
import { ExportImageFormat, getExportImageFileExtension } from "./format.ts";

interface Props {
    material: Material;
    fileNames: ReactiveMap<number, string>;
    selectedNodes: ReactiveSet<number>;
    fileFormat: ExportImageFormat;
}

export default function ExportDialogOutputNodesPanel(props: Props) {
    const allOutputNodes = () =>
        Array.from(props.material.nodes.values()).filter((x) => x.path === "materializer/output");

    function toggleOutputNode(node: MaterialNode) {
        if (props.selectedNodes.has(node.id)) {
            props.selectedNodes.delete(node.id);
        } else {
            if (!props.fileNames.has(node.id)) {
                props.fileNames.set(node.id, props.material.name + "_" + node.name);
            }

            props.selectedNodes.add(node.id);
        }
    }

    return (
        <div class="flex flex-col gap-2 mt-2">
            <Show when={allOutputNodes().length === 0}>
                <div class="text-sm mt-1 text-washed-red-900">
                    Active material does not have any output nodes.
                </div>
            </Show>

            <For each={allOutputNodes()}>
                {(node) => (
                    <div
                        class="gap-3 items-center"
                        style={{
                            display: "grid",
                            "grid-template-columns": "22px 1fr 1fr auto",
                        }}
                    >
                        <div
                            class={`border border-gray-200 rounded-md ${
                                props.selectedNodes.has(node.id)
                                    ? "bg-gray-0 hover:bg-gray-100 active:bg-gray-200"
                                    : "bg-gray-100 hover:bg-gray-200 active:bg-gray-300"
                            }`}
                            onClick={() => toggleOutputNode(node)}
                        >
                            <div class="w-[20px] h-[20px] flex items-center justify-center">
                                {props.selectedNodes.has(node.id) && <RiSystemCheckFill />}
                            </div>
                        </div>

                        <div class="text-sm flex items-center gap-2">{node.name}</div>

                        <TextInput
                            value={props.fileNames.get(node.id) ?? ""}
                            readOnly={!props.selectedNodes.has(node.id)}
                            onChange={(value) => props.fileNames.set(node.id, value)}
                        />
                        <div class="text-sm">.{getExportImageFileExtension(props.fileFormat)}</div>
                    </div>
                )}
            </For>
        </div>
    );
}

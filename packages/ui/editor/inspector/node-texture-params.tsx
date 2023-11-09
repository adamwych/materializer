import { Show } from "solid-js";
import { useMaterialStore } from "../../../stores/material";
import { MaterialNode } from "../../../material/node";
import TextureFilterMethod from "../../../types/texture-filter";
import PanelSection from "../../components/panel/section";
import SelectOption from "../../components/select/option";
import Select from "../../components/select/select";
import HorizontalSlider from "../../components/slider/horizontalSlider";
import InspectorPanelField from "./field";

type Props = {
    node: MaterialNode;
};

export default function InspectorNodeTextureParameters(props: Props) {
    const materialStore = useMaterialStore()!;

    return (
        <Show when={props.node.path !== "materializer/output"}>
            <PanelSection label="Texture">
                <InspectorPanelField label="Size">
                    <div class="flex items-center justify-between">
                        <span class="w-[96px] text-sm">
                            {props.node.textureSize}x{props.node.textureSize}
                        </span>
                        <HorizontalSlider
                            min={1}
                            max={2048}
                            step={32}
                            value={props.node.textureSize}
                            onChange={(v) => materialStore.setNodeTextureSize(props.node.id, v)}
                        />
                    </div>

                    {props.node.path === "materializer/solid-color" && (
                        <div class="text-xs text-gray-800 mt-2">
                            <strong>Note:</strong> Increasing texture size of a 'Solid color' node
                            does not bring any benefits and will waste your GPU's memory.
                        </div>
                    )}
                </InspectorPanelField>

                <InspectorPanelField label="Filtering">
                    <Select
                        label={
                            props.node.textureFilterMethod === TextureFilterMethod.Linear
                                ? "Linear"
                                : "Nearest"
                        }
                        value={props.node.textureFilterMethod}
                        onChange={(v) => materialStore.setNodeTextureFilterMethod(props.node.id, v)}
                    >
                        <SelectOption value={TextureFilterMethod.Linear}>Linear</SelectOption>
                        <SelectOption value={TextureFilterMethod.Nearest}>Nearest</SelectOption>
                    </Select>
                </InspectorPanelField>
            </PanelSection>
        </Show>
    );
}

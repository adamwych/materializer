import { Show } from "solid-js";
import { MaterialNode } from "../../../material/node";
import { useMaterialStore } from "../../../stores/material";
import TextureFilterMethod from "../../../types/texture-filter";
import PanelSection from "../../components/panel/section";
import SelectOption from "../../components/select/option";
import Select from "../../components/select/select";
import InspectorPanelField from "./field";
import InspectorNodeTextureSizeParameter from "./node-texture-size-param";

type Props = {
    node: MaterialNode;
};

export default function InspectorNodeTextureParameters(props: Props) {
    const materialStore = useMaterialStore()!;

    return (
        <Show when={props.node.path !== "materializer/output"}>
            <PanelSection label="Texture">
                <InspectorNodeTextureSizeParameter node={props.node} />

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

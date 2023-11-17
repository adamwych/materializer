import { Show } from "solid-js";
import { unwrap } from "solid-js/store";
import { MaterialNode } from "../../../material/node";
import { useMaterialStore } from "../../../stores/material";
import TextureFilterMethod, { translateFilterMethod } from "../../../types/texture-filter";
import PanelSection from "../../components/panel/section";
import SelectOption from "../../components/select/option";
import Select from "../../components/select/select";
import { useEditorHistory } from "../canvas/interaction/history";
import InspectorPanelField from "./field";
import HorizontalTextureSizeSlider from "./node-texture-size-param";

type Props = {
    node: MaterialNode;
};

export default function InspectorNodeTextureParameters(props: Props) {
    const materialStore = useMaterialStore()!;
    const history = useEditorHistory()!;

    function onTextureSizeSliderBlur(startValue: number) {
        const newValue = unwrap(props.node.textureSize);
        history.pushNodeTextureSizeChanged(props.node, newValue, startValue);
    }

    return (
        <Show when={props.node.path !== "materializer/output"}>
            <PanelSection label="Texture">
                {props.node.path !== "materializer/solid-color" && (
                    <InspectorPanelField label="Size">
                        <HorizontalTextureSizeSlider
                            value={props.node.textureSize}
                            onChange={(value) =>
                                materialStore.setNodeTextureSize(props.node.id, value, true, false)
                            }
                            onBlur={onTextureSizeSliderBlur}
                        />
                    </InspectorPanelField>
                )}

                <InspectorPanelField label="Filtering">
                    <Select
                        label={translateFilterMethod(props.node.textureFilterMethod)}
                        value={props.node.textureFilterMethod}
                        onChange={(v) => materialStore.setNodeTextureFilterMethod(props.node.id, v)}
                    >
                        <SelectOption value={TextureFilterMethod.Linear}>
                            {translateFilterMethod(TextureFilterMethod.Linear)}
                        </SelectOption>
                        <SelectOption value={TextureFilterMethod.Nearest}>
                            {translateFilterMethod(TextureFilterMethod.Nearest)}
                        </SelectOption>
                    </Select>
                </InspectorPanelField>
            </PanelSection>
        </Show>
    );
}

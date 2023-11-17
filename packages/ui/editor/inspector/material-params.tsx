import { useMaterialStore } from "../../../stores/material";
import TextureFilterMethod from "../../../types/texture-filter";
import TextInput from "../../components/input/text-input";
import PanelSection from "../../components/panel/section";
import SelectOption from "../../components/select/option";
import Select from "../../components/select/select";
import InspectorPanelField from "./field";
import HorizontalTextureSizeSlider from "./node-texture-size-param";

export default function InspectorMaterialParameters() {
    const materialStore = useMaterialStore()!;
    const material = materialStore.getMaterial();

    return (
        <>
            <PanelSection label="Material">
                <InspectorPanelField label="Name">
                    <TextInput value={materialStore.getName()} onInput={materialStore.setName} />
                </InspectorPanelField>
            </PanelSection>

            <PanelSection label="Workflow" class="border-none">
                <InspectorPanelField label="Default texture size">
                    <HorizontalTextureSizeSlider
                        value={material.defaultTextureSize}
                        onChange={materialStore.setDefaultTextureSize}
                    />
                </InspectorPanelField>

                <InspectorPanelField label="Default texture filter">
                    <Select
                        label={
                            material.defaultTextureFilter === TextureFilterMethod.Linear
                                ? "Linear (smooth)"
                                : "Nearest (pixelated)"
                        }
                        value={material.defaultTextureFilter}
                        onChange={materialStore.setDefaultTextureFilter}
                    >
                        <SelectOption value={TextureFilterMethod.Linear}>
                            Linear (smooth)
                        </SelectOption>
                        <SelectOption value={TextureFilterMethod.Nearest}>
                            Nearest (pixelated)
                        </SelectOption>
                    </Select>
                </InspectorPanelField>
            </PanelSection>
        </>
    );
}

import { useMaterialStore } from "../../../stores/material";
import TextureFilterMethod, { translateFilterMethod } from "../../../types/texture-filter";
import Button from "../../components/button/button";
import PanelSection from "../../components/panel/section";
import SelectOption from "../../components/select/option";
import Select from "../../components/select/select";
import InspectorPanelField from "./field";
import HorizontalTextureSizeSlider from "./node-texture-size-param";

export default function InspectorWorkflowParameters() {
    const materialStore = useMaterialStore()!;
    const material = materialStore.getMaterial();

    function set3DParams() {
        materialStore.setDefaultTextureSize(1024);
        materialStore.setDefaultTextureFilter(TextureFilterMethod.Linear);
    }

    function set2DParams() {
        materialStore.setDefaultTextureSize(16);
        materialStore.setDefaultTextureFilter(TextureFilterMethod.Nearest);
    }

    return (
        <PanelSection
            label="Workflow"
            class="border-none"
            titleButtons={[
                <Button size="tiny" onClick={set3DParams}>
                    3D (Metallic PBR)
                </Button>,
                <Button size="tiny" onClick={set2DParams}>
                    2D (Pixel-art)
                </Button>,
            ]}
        >
            <InspectorPanelField
                label="Default texture size"
                onReset={() => materialStore.setDefaultTextureSize(1024)}
            >
                <HorizontalTextureSizeSlider
                    value={material.defaultTextureSize}
                    onChange={materialStore.setDefaultTextureSize}
                />
            </InspectorPanelField>

            <InspectorPanelField
                label="Default texture filter"
                onReset={() => materialStore.setDefaultTextureFilter(TextureFilterMethod.Linear)}
            >
                <Select
                    label={translateFilterMethod(material.defaultTextureFilter)}
                    value={material.defaultTextureFilter}
                    onChange={materialStore.setDefaultTextureFilter}
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
    );
}

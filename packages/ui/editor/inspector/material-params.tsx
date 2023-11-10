import { useMaterialStore } from "../../../stores/material";
import TextInput from "../../components/input/text-input";
import PanelSection from "../../components/panel/section";
import InspectorPanelField from "./field";

export default function InspectorMaterialParameters() {
    const materialStore = useMaterialStore()!;

    return (
        <PanelSection label="Material" class="border-none">
            <InspectorPanelField label="Name">
                <TextInput value={materialStore.getName()} onInput={materialStore.setName} />
            </InspectorPanelField>
        </PanelSection>
    );
}

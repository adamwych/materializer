import { useMaterialStore } from "../../../stores/material";
import TextInput from "../../components/input/text-input";
import PanelSection from "../../components/panel/section";

export default function InspectorMaterialParameters() {
    const materialStore = useMaterialStore()!;

    return (
        <PanelSection label="Material">
            <div class="p-4">
                <TextInput value={materialStore.getName()} onInput={materialStore.setName} />
            </div>
        </PanelSection>
    );
}

import PanelSection from "../../components/panel/section";
import { useMaterialContext } from "../material-context";
import MaterialNodeInspectorParameter from "./parameter";

export default function MaterialParametersInspectorSection() {
    const materialCtx = useMaterialContext()!;

    return (
        <PanelSection label="Material">
            <div class="-m-4">
                <MaterialNodeInspectorParameter
                    parameter={{
                        label: "Texture Size",
                        type: "number",
                        valueType: "int",
                        min: 32,
                        max: 2048,
                        step: 32,
                    }}
                    value={materialCtx.getOutputTextureWidth}
                    onChange={materialCtx.setOutputTextureSize}
                >
                    <div class="py-1 pt-2 text-xs text-washed-red-900 flex items-center gap-1">
                        <strong>Warning:</strong> Changing texture size will re-render{" "}
                        <strong>all</strong> nodes.
                    </div>
                </MaterialNodeInspectorParameter>
            </div>
        </PanelSection>
    );
}

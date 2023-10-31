import TextInput from "../../components/input/text-input";
import PanelSection from "../../components/panel/section";
import { useMaterialContext } from "../material-context";
import MaterialNodeInspectorParameter from "./parameter";

export default function MaterialParametersInspectorSection() {
    const materialCtx = useMaterialContext()!;

    return (
        <>
            <PanelSection label="Name">
                <TextInput value={materialCtx.getName()} onInput={materialCtx.setName} />
            </PanelSection>

            <PanelSection label="Material">
                <div class="-m-4">
                    <div class="p-4 text-xs text-washed-red-900 text-center">
                        Changing any of those parameters will will re-render <strong>all</strong>{" "}
                        nodes.
                    </div>

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
                    />

                    <MaterialNodeInspectorParameter
                        parameter={{
                            label: "Texture Filtering",
                            type: "select",
                            valueType: "int",
                            options: [
                                {
                                    label: "Linear",
                                    value: 0,
                                },
                                {
                                    label: "Nearest",
                                    value: 1,
                                },
                            ],
                        }}
                        value={materialCtx.getOutputTextureFiltering}
                        onChange={materialCtx.setOutputTextureFiltering}
                    />
                </div>
            </PanelSection>
        </>
    );
}

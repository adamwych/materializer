import { useEditorContext } from "../editor-context.ts";
import { For, Show } from "solid-js";
import MaterialNodeInspectorParameter from "./parameter.tsx";
import { useMaterialContext } from "../material-context.ts";
import PanelSection from "../../components/panel/section.tsx";
import TextInput from "../../components/input/text-input.tsx";

export default function MaterialNodeInspectorPanel() {
    const editorCtx = useEditorContext()!;
    const materialCtx = useMaterialContext()!;
    const node = editorCtx.getInspectedNode();
    const visibleParameters = () => {
        const n = node()!;
        const allParameters = n.spec!.parameters;
        return allParameters.filter((info) => {
            if (info.when) {
                // FIXME: Don't use eval()!
                return eval?.(`((params) => ${info.when})(${JSON.stringify(n.parameters)});`);
            }
            return true;
        });
    };

    function onNameChange(name: string) {
        materialCtx.setNodeLabel(node()!.id, name);
    }

    function onParameterChange(id: string, value: unknown) {
        materialCtx.setNodeParameter(node()!.id, id, value);
    }

    return (
        <div class="bg-gray-200 overflow-auto flex-1">
            <Show when={node()}>
                <PanelSection label="Name">
                    <TextInput value={node()!.label} onInput={onNameChange} />
                </PanelSection>

                <PanelSection label="Parameters">
                    <div class="-m-4">
                        <For each={visibleParameters()}>
                            {(parameter) => (
                                <MaterialNodeInspectorParameter
                                    parameter={parameter}
                                    value={() => node()?.parameters[parameter.id]}
                                    onChange={(value) => onParameterChange(parameter.id, value)}
                                />
                            )}
                        </For>
                    </div>
                </PanelSection>
            </Show>
        </div>
    );
}

import { useEditorContext } from "../editor-context.ts";
import { For, Show } from "solid-js";
import MaterialNodeInspectorParameter from "./parameter.tsx";
import { useMaterialContext } from "../material-context.ts";
import PanelSection from "../../components/panel/section.tsx";

export default function MaterialNodeInspectorPanel() {
    const editorCtx = useEditorContext()!;
    const materialCtx = useMaterialContext()!;
    const node = editorCtx.getInspectedNode();

    function onNameChange(name: string) {
        materialCtx.setNodeLabel(node()!.id, name);
    }

    function onParameterChange(id: string, value: unknown) {
        materialCtx.setNodeParameter(node()!.id, id, value);
    }

    return (
        <div class="bg-gray-200-0 overflow-auto flex-1">
            <Show when={node()}>
                <PanelSection label="Name">
                    <input
                        class="w-full bg-gray-100-0 p-2 rounded-sm"
                        type="text"
                        value={node()!.label}
                        onInput={(ev) => onNameChange(ev.target.value)}
                    />
                </PanelSection>

                <PanelSection label="Parameters">
                    <For each={node()!.spec!.parameters}>
                        {(parameter) => (
                            <MaterialNodeInspectorParameter
                                parameter={parameter}
                                value={() => node()?.parameters[parameter.id]}
                                onChange={(value) => onParameterChange(parameter.id, value)}
                            />
                        )}
                    </For>
                </PanelSection>
            </Show>
        </div>
    );
}

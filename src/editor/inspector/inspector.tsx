import { useEditorContext } from "../editor-context.ts";
import { For, Show } from "solid-js";
import MaterialNodeInspectorParameter from "./parameter.tsx";
import { useMaterialContext } from "../material-context.ts";

export default function MaterialNodeInspectorPanel() {
    const editorCtx = useEditorContext()!;
    const materialCtx = useMaterialContext()!;
    const node = editorCtx.getInspectedNode();

    function onParameterChange(id: string, value: unknown) {
        materialCtx.setNodeParameter(node()!.id, id, value);
    }

    return (
        <div class="bg-gray-200-0 overflow-auto flex-1" style={{ width: "400px" }}>
            <Show when={node()}>
                <div class="px-4 py-2 text-sm flex items-center justify-between bg-gray-300-0 border-b border-gray-400-0 font-semibold uppercase text-gray-800-0">
                    Parameters
                </div>

                <For each={node()!.spec!.parameters}>
                    {(parameter) => (
                        <MaterialNodeInspectorParameter
                            parameter={parameter}
                            value={() => node()?.parameters[parameter.id]}
                            onChange={(value) => onParameterChange(parameter.id, value)}
                        />
                    )}
                </For>
            </Show>
        </div>
    );
}

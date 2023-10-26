import { useEditorContext } from "../editor-context.ts";
import { For, Show } from "solid-js";
import MaterialNodeInspectorParameter from "./parameter.tsx";
import { useMaterialContext } from "../material-context.ts";

export default function MaterialNodeInspectorPanel() {
    const editorCtx = useEditorContext()!;
    const materialCtx = useMaterialContext()!;
    const node = editorCtx.getInspectedNode();

    function onParameterChange(id: string, value: unknown) {
        const n = node()!;
        materialCtx.setNodeParameter(n.id, id, value);
    }

    return (
        <div class="h-full bg-gray-200-0 p-4" style={{ width: "448px" }}>
            <Show when={node()}>
                <h1 class="font-semibold uppercase text-gray-700-0">Parameters</h1>

                <For each={node()!.spec!.parameters}>
                    {(parameter) => (
                        <MaterialNodeInspectorParameter
                            name={parameter.id}
                            value={() => node()?.parameters[parameter.id]}
                            onChange={(value) => onParameterChange(parameter.id, value)}
                        />
                    )}
                </For>
            </Show>
        </div>
    );
}

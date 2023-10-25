import { useEditorRuntimeContext } from "../runtime-context.tsx";
import { createMemo, For, Show } from "solid-js";
import MaterialNodeInspectorParameter from "./parameter.tsx";
import { useEditorMaterialContext } from "../material-context.ts";

export default function MaterialNodeInspectorPanel() {
    const editorCtx = useEditorRuntimeContext();
    const materialCtx = useEditorMaterialContext()!;
    const node = editorCtx.getInspectedNode();
    const parameterInfos = createMemo(() => {
        const theNode = node();
        if (theNode) {
            const nodeInfo = editorCtx.getNodeInfo(theNode.id);
            return nodeInfo()!.parameters;
        }
        return [];
    });

    function onParameterChange(id: string, value: unknown) {
        const n = node()!;
        materialCtx.setNodeParameter(n.id, id, value);
        editorCtx.scheduleNodeRender(n);
    }

    return (
        <div class="h-full bg-gray-200-0 p-4" style={{ width: "448px" }}>
            <Show when={node()}>
                <h1 class="font-semibold uppercase text-gray-700-0">
                    Parameters
                </h1>

                <For each={parameterInfos()}>
                    {(parameter) => (
                        <MaterialNodeInspectorParameter
                            name={parameter.id}
                            value={() => node()?.parameters[parameter.id]}
                            onChange={(value) =>
                                onParameterChange(parameter.id, value)
                            }
                        />
                    )}
                </For>
            </Show>
        </div>
    );
}

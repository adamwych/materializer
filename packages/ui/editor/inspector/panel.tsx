import { Show } from "solid-js";
import { MaterialNode } from "../../../material/node";
import { useMaterialStore } from "../../../stores/material";
import cn from "../../../utils/cn";
import { useEditorSelectionManager } from "../canvas/interaction/selection";
import InspectorMaterialParameters from "./material-params";
import InspectorNodeParameters from "./node-params";
import InspectorWorkflowParameters from "./workflow-params";

type Props = {
    class?: string;
};

export default function InspectorPanel(props: Props) {
    const selectionManager = useEditorSelectionManager()!;
    const materialStore = useMaterialStore()!;
    const selectedNodes = () =>
        selectionManager
            .selectedNodes()
            .map((id) => materialStore.getNodeById(id))
            .filter((x): x is MaterialNode => x !== undefined);

    return (
        <div class={cn("flex-1 overflow-auto border-b border-gray-200", props.class)}>
            <Show when={selectedNodes().length === 0}>
                <InspectorMaterialParameters />
                <InspectorWorkflowParameters />
            </Show>

            <Show when={selectedNodes().length === 1}>
                <InspectorNodeParameters node={selectedNodes()[0]} />
            </Show>
        </div>
    );
}

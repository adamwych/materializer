import { Show } from "solid-js";
import { useMaterialStore } from "../../../stores/material";
import { Material } from "../../../types/material";
import cn from "../../../utils/cn";
import { useEditorSelectionManager } from "../canvas/interaction/selection";
import InspectorMaterialParameters from "./material-params";
import InspectorNodeParameters from "./node-params";

type Props = {
    material: Material;
    class?: string;
};

export default function InspectorPanel(props: Props) {
    const selectionManager = useEditorSelectionManager()!;
    const materialActions = useMaterialStore()!;
    const selectedNodes = () => selectionManager.selectedNodes();

    return (
        <div
            class={cn(
                "w-[340px] h-full",
                "overflow-auto",
                "bg-gray-100",
                "border-l border-gray-200",
                props.class,
            )}
        >
            <Show when={selectedNodes().length === 0}>
                <InspectorMaterialParameters />
            </Show>

            <Show when={selectedNodes().length === 1}>
                <InspectorNodeParameters node={materialActions.getNodeById(selectedNodes()[0])!} />
            </Show>
        </div>
    );
}

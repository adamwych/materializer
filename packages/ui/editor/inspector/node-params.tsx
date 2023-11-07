import { For } from "solid-js";
import { useNodeBlueprintsStore } from "../../../stores/blueprints";
import { useMaterialStore } from "../../../stores/material";
import { MaterialNode } from "../../../types/node";
import InspectorNodeParameter from "./parameter";

type Props = {
    node: MaterialNode;
};

export default function InspectorNodeParameters(props: Props) {
    const materialActions = useMaterialStore()!;
    const pkgsRegistry = useNodeBlueprintsStore()!;
    const spec = () => pkgsRegistry.getBlueprintByPath(props.node.path)!;

    return (
        <For each={Object.values(spec()!.parameters)}>
            {(parameter) => (
                <InspectorNodeParameter
                    parameter={parameter}
                    value={() => props.node.parameters[parameter.id] ?? parameter.default}
                    onChange={(v) =>
                        materialActions.setNodeParameter(props.node.id, parameter.id, v)
                    }
                />
            )}
        </For>
    );
}

import { For, Show } from "solid-js";
import { useNodeBlueprintsStore } from "../../../stores/blueprints";
import { useMaterialStore } from "../../../stores/material";
import { MaterialNode } from "../../../material/node";
import InspectorNodeParameter from "./parameter";
import PanelSection from "../../components/panel/section";
import InspectorNodeTextureParameters from "./node-texture-params";

type Props = {
    node: MaterialNode;
};

export default function InspectorNodeParameters(props: Props) {
    const materialActions = useMaterialStore()!;
    const pkgsRegistry = useNodeBlueprintsStore()!;
    const spec = () => pkgsRegistry.getBlueprintByPath(props.node.path)!;
    const parameters = () => Object.values(spec()!.parameters);

    return (
        <>
            <InspectorNodeTextureParameters node={props.node} />
            <PanelSection label="Parameters">
                <Show when={parameters().length === 0}>
                    <div class="p-4 text-gray-700 text-sm">
                        This node does not define any parameters.
                    </div>
                </Show>

                <For each={parameters()}>
                    {(parameter) => (
                        <InspectorNodeParameter
                            parameter={parameter}
                            value={() => props.node.parameters[parameter.id] ?? parameter.default}
                            onChange={(v) =>
                                materialActions.setNodeParameter(props.node.id, parameter.id, v)
                            }
                            onResetToDefault={() =>
                                materialActions.setNodeParameter(
                                    props.node.id,
                                    parameter.id,
                                    spec().parameters[parameter.id]?.default,
                                )
                            }
                        />
                    )}
                </For>
            </PanelSection>
        </>
    );
}

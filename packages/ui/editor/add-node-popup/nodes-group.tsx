import { For } from "solid-js";
import { MaterialNodeBlueprint } from "../../../material/node";
import EditorAddNodePopupNodesGroupItem from "./nodes-group-item";

type Props = {
    name: string;
    nodes: Map<string, MaterialNodeBlueprint>;
    onItemClick(id: string, blueprint: MaterialNodeBlueprint): void;
};

export default function EditorAddNodePopupNodesGroup(props: Props) {
    return (
        <div>
            <div class="pl-[25px]">
                <span class="font-semibold text-xs text-gray-800">{props.name}</span>
            </div>

            <For each={Array.from(props.nodes)}>
                {([id, spec]) => (
                    <EditorAddNodePopupNodesGroupItem
                        spec={spec}
                        onClick={() => props.onItemClick(id, spec)}
                    />
                )}
            </For>
        </div>
    );
}

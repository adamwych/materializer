import { RiOthersBox1Fill } from "solid-icons/ri";
import { For } from "solid-js";
import { MaterialNodeBlueprint, MaterialNodeBlueprintsPackage } from "../../../types/node";
import EditorAddNodePopupNodesGroup from "./nodes-group";

type Props = {
    id: string;
    package: MaterialNodeBlueprintsPackage;
    onItemClick(packageId: string, nodeId: string): void;
};

export default function EditorAddNodePopupPackage(props: Props) {
    const nodeGroups = () => {
        const groups = new Map<string, Map<string, MaterialNodeBlueprint>>();
        for (const [path, spec] of props.package.entries()) {
            const group = groups.get(spec.groupName) ?? new Map<string, MaterialNodeBlueprint>();
            group.set(path, spec);
            groups.set(spec.groupName, group);
        }
        return Array.from(groups);
    };

    return (
        <div>
            <div class="p-2 flex items-center gap-2">
                <RiOthersBox1Fill size={12} />
                <span class="font-semibold text-xs">{props.id}</span>
            </div>
            <For each={nodeGroups()}>
                {([groupName, nodes]) => (
                    <EditorAddNodePopupNodesGroup
                        name={groupName}
                        nodes={nodes}
                        onItemClick={(id) => props.onItemClick(props.id, id)}
                    />
                )}
            </For>
        </div>
    );
}

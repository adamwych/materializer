import { For } from "solid-js";
import { RiMediaImage2Fill, RiOthersBox1Fill } from "solid-icons/ri";
import { MaterialNodeSpec, MaterialNodesPackage } from "../types/material.ts";

type Props = {
    id: string;
    package: MaterialNodesPackage;
    onItemClick(typePath: string): void;
};

export default function MaterialGraphNewNodePopoverPackage(props: Props) {
    const nodeGroups = () => {
        const groups = new Map<string, Array<[string, MaterialNodeSpec]>>();
        for (const [path, spec] of props.package.nodes.entries()) {
            const group = groups.get(spec.groupName) ?? [];
            group.push([path, spec]);
            groups.set(spec.groupName, group);
        }
        return groups;
    };

    return (
        <div class="bg-gray-300 py-2">
            <div class="p-2 flex items-center gap-1">
                <RiOthersBox1Fill size={12} />
                <span class="font-semibold text-xs" style={{ position: "relative", top: "-1px" }}>
                    {props.id.substring(1)}
                </span>
            </div>
            <For each={Array.from(nodeGroups().entries())}>
                {([groupName, nodes]) => (
                    <div>
                        <div class="py-1 pl-[23px] font-semibold text-xs text-gray-800">
                            {groupName}
                        </div>
                        <For each={nodes}>
                            {([typeId, spec]) => (
                                <li
                                    class="p-2 pl-[32px] text-sm hover:bg-gray-400 active:bg-gray-200 flex items-center gap-1"
                                    onClick={() => props.onItemClick(`${props.id}/${typeId}`)}
                                >
                                    <RiMediaImage2Fill size={16} />
                                    <div>{spec.name}</div>
                                </li>
                            )}
                        </For>
                    </div>
                )}
            </For>
        </div>
    );
}

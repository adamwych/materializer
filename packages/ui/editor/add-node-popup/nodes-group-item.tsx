import { RiMediaImage2Fill } from "solid-icons/ri";
import { MaterialNodeBlueprint } from "../../../types/node";
import cn from "../../../utils/cn";

type Props = {
    spec: MaterialNodeBlueprint;
    onClick(): void;
};

export default function EditorAddNodePopupNodesGroupItem(props: Props) {
    return (
        <div
            class={cn(
                "flex items-center gap-1",
                "p-2 pl-[36px]",
                "hover:bg-gray-200 active:bg-gray-100",
            )}
            onClick={props.onClick}
        >
            <RiMediaImage2Fill size={16} />
            <span class="text-sm">{props.spec.name}</span>
        </div>
    );
}

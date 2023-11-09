import { RiSystemCloseFill } from "solid-icons/ri";
import { useWorkspaceStore } from "../../stores/workspace";
import { useWorkspaceHistory } from "../../stores/workspace-history";
import { Material } from "../../material/material";
import cn from "../../utils/cn";

type Props = {
    material: Material;
};

export default function WorkspacePanelItem(props: Props) {
    const workspace = useWorkspaceStore()!;
    const workspaceHistory = useWorkspaceHistory()!;

    return (
        <div
            class={cn(
                "px-3 py-2",
                "flex items-center justify-between",
                workspace.isActiveMaterial(props.material.id)
                    ? "bg-blue-500"
                    : "hover:bg-gray-200 active:bg-gray-100",
            )}
            onClick={() => workspace.addMaterial(props.material)}
            onAuxClick={() => workspace.deleteMaterial(props.material.id)}
        >
            <span>
                {props.material.name}
                {workspaceHistory.hasUnsavedChanges(props.material.id) && " *"}
            </span>

            <div
                class={cn(
                    "flex items-center justify-center",
                    "w-[16px] h-[16px]",
                    "bg-gray-200 bg-opacity-50",
                    "hover:bg-gray-300 hover:bg-opacity-50",
                    "active:bg-gray-100 active:bg-opacity-50",
                    "rounded-full",
                )}
                onClick={() => workspace.deleteMaterial(props.material.id)}
            >
                <RiSystemCloseFill size={12} />
            </div>
        </div>
    );
}

import { RiSystemCloseFill } from "solid-icons/ri";
import { Material } from "../types/material.ts";
import { useWorkspaceContext } from "../workspace-context.ts";

interface Props {
    material: Material;
}

export default function EditorTabButton(props: Props) {
    const material = props.material;
    const workspace = useWorkspaceContext()!;
    const isCurrentTab = () => material.id === workspace.activeMaterialId();

    function onTabClick(ev: MouseEvent) {
        if (ev.button === 0) {
            workspace.setActiveMaterialId(material.id);
        }
    }

    function onTabAuxClick(ev: MouseEvent) {
        if (ev.button === 1) {
            workspace.closeEditorTab(material.id);
        }
    }

    function onCloseButtonClick(ev: MouseEvent) {
        ev.stopPropagation();
        workspace.closeEditorTab(material.id);
    }

    return (
        <div
            class={`px-4 animate-fade-in flex items-center gap-2 h-[35px] text-sm border-r border-gray-200 ${
                isCurrentTab() ? "bg-blue-500" : "hover:bg-gray-200 active:bg-gray-100"
            }`}
            onClick={onTabClick}
            onAuxClick={onTabAuxClick}
        >
            <span>{material.name}</span>
            <div
                class="text-xs bg-gray-100 bg-opacity-50 hover:bg-gray-300 hover:bg-opacity-50 active:bg-gray-200 active:bg-opacity-50 rounded-full p-0.5"
                onClick={onCloseButtonClick}
            >
                <RiSystemCloseFill />
            </div>
        </div>
    );
}

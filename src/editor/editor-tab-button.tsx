import MaterialGraphEditor from "./editor.tsx";
import { For, Show, createEffect, createSignal, on } from "solid-js";
import { useWorkspaceContext } from "../workspace-context.ts";
import { RiSystemAddFill, RiSystemCloseFill } from "solid-icons/ri";
import EditorWelcomeMessage from "./welcome.tsx";
import { Material } from "../types/material.ts";

interface Props {
    material: Material;
}

export default function EditorTabButton(props: Props) {
    const workspace = useWorkspaceContext()!;
    const isCurrentTab = () => props.material.id === workspace.activeEditorTab();

    function onTabClick(ev: MouseEvent, materialId: string) {
        if (ev.button === 0) {
            workspace.setActiveEditorTab(materialId);
        }
    }

    function onTabAuxClick(ev: MouseEvent, materialId: string) {
        if (ev.button === 1) {
            workspace.closeEditorTab(materialId);
        }
    }

    return (
        <div
            class={`px-4 animate-fade-in flex items-center gap-2 h-[35px] text-sm border-r border-gray-300 ${
                isCurrentTab() ? "bg-blue-500" : "hover:bg-gray-300 active:bg-gray-200"
            }`}
            onClick={(ev) => onTabClick(ev, props.material.id)}
            onAuxClick={(ev) => onTabAuxClick(ev, props.material.id)}
        >
            <span>{props.material.name}</span>
            <div
                class="text-xs bg-gray-100 bg-opacity-50 hover:bg-gray-300 hover:bg-opacity-50 active:bg-gray-200 active:bg-opacity-50 rounded-full p-0.5"
                onClick={(ev) => {
                    ev.stopPropagation();
                    workspace.closeEditorTab(props.material.id);
                }}
            >
                <RiSystemCloseFill />
            </div>
        </div>
    );
}

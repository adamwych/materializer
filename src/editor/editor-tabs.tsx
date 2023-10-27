import MaterialGraphEditor from "./editor.tsx";
import { For } from "solid-js";
import { useWorkspaceContext } from "../workspace-context.ts";

export default function EditorTabs() {
    const workspace = useWorkspaceContext()!;

    return (
        <div class="w-full h-full flex flex-col flex-1">
            <div class="flex items-center">
                <For each={workspace.openedMaterials()}>
                    {(material, index) => (
                        <div
                            class={`px-3 py-2 hover:bg-gray-300-0 active:bg-gray-200-0 ${
                                index() === workspace.activeEditorTab() && "bg-gray-400-0"
                            }`}
                        >
                            {material.name}
                        </div>
                    )}
                </For>
            </div>

            <MaterialGraphEditor material={workspace.activeEditorTabMaterial()!} />
        </div>
    );
}

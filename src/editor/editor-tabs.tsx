import MaterialGraphEditor from "./editor.tsx";
import { For, Show, createEffect, createSignal, on } from "solid-js";
import { useWorkspaceContext } from "../workspace-context.ts";
import { RiSystemAddFill } from "solid-icons/ri";

export default function EditorTabs() {
    const workspace = useWorkspaceContext()!;
    const [hidden, setHidden] = createSignal(false);

    function openNewTab() {
        workspace.openMaterial({
            name: "Test",
            nodes: [],
            textureWidth: 2048,
            textureHeight: 2048,
            connections: [],
        });
    }

    // Show & hide the graph to ensure that everything fully re-initializes
    // after changing active tab.
    createEffect(
        on(workspace.activeEditorTab, () => {
            setHidden(true);
            setTimeout(() => setHidden(false));
        }),
    );

    return (
        <div class="w-full h-full flex flex-col flex-1">
            <div class="flex items-center bg-gray-200">
                <For each={workspace.openedMaterials()}>
                    {(material, index) => (
                        <div
                            class={`px-4 animate-fade-in flex items-center h-[35px] text-sm ${
                                index() === workspace.activeEditorTab()
                                    ? "bg-gray-100"
                                    : "hover:bg-gray-300 active:bg-gray-200"
                            }`}
                            onClick={() => workspace.setActiveEditorTab(index)}
                        >
                            {material.name}
                        </div>
                    )}
                </For>

                <div class="px-2 flex items-center h-[35px]">
                    <div
                        class="text-sm hover:bg-gray-300 active:bg-gray-200 p-1 rounded-md"
                        onClick={openNewTab}
                    >
                        <RiSystemAddFill />
                    </div>
                </div>
            </div>

            <Show when={!hidden()}>
                <MaterialGraphEditor material={workspace.activeEditorTabMaterial()!} />
            </Show>
        </div>
    );
}

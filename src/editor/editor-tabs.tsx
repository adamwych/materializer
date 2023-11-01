import MaterialGraphEditor from "./editor.tsx";
import { For, Show, createEffect, createSignal, on } from "solid-js";
import { useWorkspaceContext } from "../workspace-context.ts";
import { RiSystemAddFill } from "solid-icons/ri";
import EditorWelcomeMessage from "./welcome.tsx";
import EditorTabButton from "./editor-tab-button.tsx";

export default function EditorTabs() {
    const workspace = useWorkspaceContext()!;
    const [hidden, setHidden] = createSignal(false);

    // Show & hide the graph to ensure that everything fully re-initializes
    // after changing active tab.
    createEffect(
        on(workspace.activeMaterialId, () => {
            setHidden(true);
            setTimeout(() => setHidden(false));
        }),
    );

    return (
        <div class="w-full h-full flex flex-col flex-1">
            <div class="flex items-center bg-gray-100 border-b border-gray-200">
                <For each={workspace.materials}>
                    {(material) => <EditorTabButton material={material} />}
                </For>

                <div class="px-2 flex items-center h-[35px]">
                    <div
                        class="text-sm hover:bg-gray-300 active:bg-gray-200 p-1 rounded-md"
                        onClick={() => workspace.openNewMaterial()}
                    >
                        <RiSystemAddFill />
                    </div>
                </div>
            </div>

            <Show when={workspace.activeMaterialId() === undefined}>
                <EditorWelcomeMessage />
            </Show>

            <Show when={!hidden() && workspace.activeMaterialId() !== undefined}>
                <MaterialGraphEditor material={workspace.activeEditorTabMaterial()!} />
            </Show>
        </div>
    );
}

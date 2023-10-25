import { useAppContext } from "./app-context.ts";
import MaterialGraphEditor from "./graph-editor/editor.tsx";
import { For } from "solid-js";

export default function EditorTabs() {
    const context = useAppContext()!;

    return (
        <div class="w-full h-full flex flex-col">
            <div class="flex items-center">
                <For each={context.editorTabs()}>
                    {(material, index) => (
                        <div
                            class={`px-3 py-2 hover:bg-gray-300-0 active:bg-gray-200-0 ${
                                index() === context.activeEditorTab() &&
                                "bg-gray-400-0"
                            }`}
                        >
                            {material.name}
                        </div>
                    )}
                </For>
            </div>

            <div class="w-full h-full">
                <MaterialGraphEditor
                    material={context.activeEditorTabMaterial()!}
                />
            </div>
        </div>
    );
}

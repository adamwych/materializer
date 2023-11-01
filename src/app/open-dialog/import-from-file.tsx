import { RiSystemErrorWarningFill, RiSystemUpload2Fill } from "solid-icons/ri";
import { Show, createSignal } from "solid-js";
import { useWorkspaceContext } from "../../workspace-context.ts";
import { SerializedMaterial, useWorkspaceStorage } from "../../workspace-storage.ts";

export default function ImportMaterialFromFilePanel({ onClose }: { onClose: Function }) {
    const workspace = useWorkspaceContext()!;
    const workspaceStorage = useWorkspaceStorage()!;
    const [importError, setImportError] = createSignal();
    let inputElement: HTMLInputElement;

    function openFileSelectDialog() {
        setImportError(undefined);
        inputElement.value = "";
        inputElement.click();
    }

    function readAndOpenFile() {
        const reader = new FileReader();
        reader.onloadend = () => {
            try {
                const serialized = JSON.parse(reader.result as string) as SerializedMaterial;
                const material = workspaceStorage.deserializeMaterial(serialized);
                workspace.openMaterial(material);
                onClose();
            } catch (error) {
                setImportError(error);
            }
        };
        reader.readAsText(inputElement.files![0]);
    }

    return (
        <>
            <div class="flex items-center justify-between">
                <div class="text-md font-semibold">Import from file</div>
                <div
                    class="text-sm px-3 py-2 flex items-center gap-2 bg-gray-200 hover:bg-gray-300 active:bg-gray-100 rounded-md"
                    onClick={openFileSelectDialog}
                >
                    <RiSystemUpload2Fill />
                    <span class="relative top-[1px]">Select file</span>
                </div>
                <input
                    ref={(e) => (inputElement = e)}
                    class="hidden"
                    type="file"
                    accept=".mtlz,.json"
                    onChange={readAndOpenFile}
                />
            </div>

            <Show when={importError()}>
                <div class="bg-washed-red-500 flex items-center gap-1 rounded-md p-2 mt-3 animate-fade-in">
                    <RiSystemErrorWarningFill />
                    <span class="text-sm">
                        <strong>Error:</strong> {importError()!.toString()}
                    </span>
                </div>
            </Show>
        </>
    );
}

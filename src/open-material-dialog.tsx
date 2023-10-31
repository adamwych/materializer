import { For } from "solid-js";
import Dialog from "./components/dialog/dialog.tsx";
import { useWorkspaceContext } from "./workspace-context.ts";
import { useWorkspaceStorage } from "./workspace-storage.ts";

interface Props {
    onClose(): void;
}

export default function OpenMaterialDialog(props: Props) {
    const workspace = useWorkspaceContext()!;
    const workspaceStorage = useWorkspaceStorage()!;

    return (
        <Dialog
            title="Open Material"
            buttons={[
                {
                    label: "Cancel",
                    onClick: props.onClose,
                },
            ]}
        >
            <div class="flex flex-col rounded-md overflow-hidden">
                <For each={Array.from(workspaceStorage.getSavedMaterials().values())}>
                    {(material) => (
                        <div
                            class="p-3 bg-gray-300 hover:bg-gray-200 active:bg-gray-100"
                            onClick={() => {
                                workspace.openMaterial(
                                    workspaceStorage.getMaterialById(material.id)!,
                                );
                                props.onClose();
                            }}
                        >
                            <div class="text-sm font-semibold">{material.name}</div>
                            <div class="text-xs text-gray-800 mt-1">
                                Saved on {new Date(material.savedAt).toUTCString()}
                            </div>
                        </div>
                    )}
                </For>
            </div>
        </Dialog>
    );
}

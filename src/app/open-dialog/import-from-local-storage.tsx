import { RiSystemDeleteBinLine } from "solid-icons/ri";
import { For } from "solid-js";
import { useWorkspaceContext } from "../../workspace-context.ts";
import { useWorkspaceStorage } from "../../workspace-storage.ts";

export default function ImportMaterialFromLocalStoragePanel({ onClose }: { onClose(): void }) {
    const workspace = useWorkspaceContext()!;
    const workspaceStorage = useWorkspaceStorage()!;
    const sortedMaterials = () => {
        return Array.from(workspaceStorage.savedMaterials().values()).sort(
            (a, b) => b.savedAt - a.savedAt,
        );
    };

    return (
        <>
            <div class="text-md font-semibold mb-2">Local storage</div>
            <div class="flex flex-wrap">
                <For each={sortedMaterials()}>
                    {(material) => (
                        <div style={{ "flex-basis": "50%" }}>
                            <div class="flex items-center">
                                <div
                                    class="p-3 flex-1 hover:bg-gray-200 active:bg-gray-100 rounded-md"
                                    onClick={() => {
                                        workspace.openMaterial(
                                            workspaceStorage.getMaterialById(material.id)!,
                                        );
                                        onClose();
                                    }}
                                >
                                    <div class="text-sm font-semibold">{material.name}</div>
                                    <div class="text-xs text-gray-800 mt-1">
                                        Saved on {new Date(material.savedAt).toUTCString()}
                                    </div>
                                </div>

                                <div
                                    class="p-2 mx-2 hover:bg-gray-200 active:bg-gray-100 rounded-md"
                                    onClick={() => workspaceStorage.removeMaterial(material.id)}
                                >
                                    <RiSystemDeleteBinLine size={16} />
                                </div>
                            </div>
                        </div>
                    )}
                </For>
            </div>
        </>
    );
}

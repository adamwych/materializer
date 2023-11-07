import { RiSystemDeleteBinLine } from "solid-icons/ri";
import { For, Show } from "solid-js";
import { useWorkspaceStore } from "../../stores/workspace";
import { useUserDataStorage } from "../../stores/storage";
import { useDialogsStore } from "../components/dialog/store";

export default function ImportMaterialFromLocalStoragePanel() {
    const workspace = useWorkspaceStore()!;
    const userDataStorage = useUserDataStorage()!;
    const dialogs = useDialogsStore()!;
    const sortedMaterials = () => {
        return Array.from(userDataStorage.savedMaterials().values()).sort(
            (a, b) => b.savedAt - a.savedAt,
        );
    };

    return (
        <>
            <div class="text-md font-semibold mb-2">Local storage</div>

            <Show when={sortedMaterials().length === 0}>
                <span class="text-gray-800">
                    There are no materials in your local storage, yet.
                </span>
            </Show>

            <div class="flex flex-wrap">
                <For each={sortedMaterials()}>
                    {(material) => (
                        <div style={{ "flex-basis": "50%" }}>
                            <div class="flex items-center">
                                <div
                                    class="p-3 flex-1 hover:bg-gray-200 active:bg-gray-100 rounded-md"
                                    onClick={() => {
                                        workspace.addMaterial(
                                            userDataStorage.getMaterialById(material.id)!,
                                        );
                                        dialogs.pop();
                                    }}
                                >
                                    <div class="text-sm font-semibold">{material.name}</div>
                                    <div class="text-xs text-gray-800 mt-1">
                                        Saved on {new Date(material.savedAt).toUTCString()}
                                    </div>
                                </div>

                                <div
                                    class="p-2 mx-2 hover:bg-gray-200 active:bg-gray-100 rounded-md"
                                    onClick={() => userDataStorage.removeMaterial(material.id)}
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

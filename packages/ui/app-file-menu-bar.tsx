import { RiDeviceSave2Fill, RiDocumentFileLine } from "solid-icons/ri";
import { Show } from "solid-js";
import { unwrap } from "solid-js/store";
import { createDefaultMaterial } from "../material/material.ts";
import { useUserDataStorage } from "../stores/storage.ts";
import { useWorkspaceStore } from "../stores/workspace.ts";
import { useDialogsStore } from "./components/dialog/store.ts";
import MenuBarSubmenuItem from "./components/menuBar/submenu-item.tsx";
import MenuBarSubmenu from "./components/menuBar/submenu.tsx";
import { useSnackbar } from "./components/snackbar/context.ts";
import ExportDialog from "./export/export-dialog.tsx";
import OpenMaterialDialog from "./open/open-dialog.tsx";

export default function AppFileMenuBar() {
    const workspace = useWorkspaceStore()!;
    const userDataStorage = useUserDataStorage()!;
    const dialogs = useDialogsStore()!;
    const snackbar = useSnackbar()!;

    async function openSaveAsDialog() {
        try {
            const material = workspace.getActiveMaterial()!;
            const handle = await window.showSaveFilePicker({
                suggestedName: material.name + ".mtlz",
                types: [
                    {
                        description: "Materializer Material",
                        accept: { "application/x-materializer": [".mtlz"] },
                    },
                ],
            });
            const writable = await handle.createWritable();
            await writable.write(
                JSON.stringify(userDataStorage.serializeMaterial(unwrap(material))),
            );
            await writable.close();

            snackbar.push({
                type: "success",
                text: "Material saved.",
                duration: 2000,
                icon: RiDeviceSave2Fill,
            });
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") {
                return;
            }

            snackbar.push({
                type: "error",
                text: `Failed to save material: ${error}.`,
                duration: 4000,
                icon: RiDeviceSave2Fill,
            });
        }
    }

    return (
        <MenuBarSubmenu label="File" icon={RiDocumentFileLine}>
            <MenuBarSubmenuItem
                label="New"
                onClick={() => workspace.addMaterial(createDefaultMaterial())}
            />

            <MenuBarSubmenuItem
                label="Open..."
                onClick={() => dialogs.show(() => <OpenMaterialDialog />)}
            />

            <Show when={workspace.getActiveMaterial()}>
                <MenuBarSubmenuItem
                    label="Save"
                    shortcut="Ctrl+S"
                    onClick={() => workspace.saveActiveMaterial()}
                />

                <Show when={"showSaveFilePicker" in window}>
                    <MenuBarSubmenuItem label="Save As..." onClick={openSaveAsDialog} />
                </Show>

                <MenuBarSubmenuItem
                    label="Export..."
                    onClick={() => dialogs.show(() => <ExportDialog />)}
                />
            </Show>
        </MenuBarSubmenu>
    );
}

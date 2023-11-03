import {
    RiDeviceSave2Fill,
    RiDocumentFileLine,
    RiLogosGithubFill,
    RiSystemAlarmWarningFill,
    RiSystemQuestionLine,
} from "solid-icons/ri";
import { Show, createSignal } from "solid-js";
import { unwrap } from "solid-js/store";
import ExportDialog from "./app/export-dialog/export-dialog.tsx";
import OpenMaterialDialog from "./app/open-dialog/open-dialog.tsx";
import MenuBarItem from "./components/menu-bar/item.tsx";
import MenuBar from "./components/menu-bar/menu-bar.tsx";
import MenuBarSubmenu from "./components/menu-bar/submenu.tsx";
import { useSnackbar } from "./components/snackbar/context.ts";
import { useWorkspaceContext } from "./workspace-context";
import { useWorkspaceStorage } from "./workspace-storage.ts";

export default function AppMenuBar() {
    const workspaceContext = useWorkspaceContext()!;
    const workspaceStorage = useWorkspaceStorage()!;
    const snackbar = useSnackbar()!;
    const [openDialogVisible, setOpenDialogVisible] = createSignal(false);
    const [exportDialogVisible, setExportDialogVisible] = createSignal(false);
    const activeMaterial = workspaceContext.activeEditorTabMaterial;

    async function openSaveAsDialog() {
        try {
            const material = activeMaterial()!;
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
                JSON.stringify(workspaceStorage.serializeMaterial(unwrap(material))),
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
        <MenuBar>
            <Show when={openDialogVisible()}>
                <OpenMaterialDialog onClose={() => setOpenDialogVisible(false)} />
            </Show>

            <Show when={exportDialogVisible()}>
                <ExportDialog onClose={() => setExportDialogVisible(false)} />
            </Show>

            <MenuBarSubmenu label="File" icon={RiDocumentFileLine}>
                <MenuBarItem label="New" onClick={() => workspaceContext.openNewMaterial()} />
                <MenuBarItem label="Open..." onClick={() => setOpenDialogVisible(true)} />
                <MenuBarItem
                    label="Save"
                    shortcut="Ctrl+S"
                    onClick={() => workspaceContext.saveActiveMaterial()}
                />
                <Show when={"showSaveFilePicker" in window}>
                    <MenuBarItem label="Save As..." onClick={openSaveAsDialog} />
                </Show>
                <Show when={activeMaterial()}>
                    <MenuBarItem label="Export..." onClick={() => setExportDialogVisible(true)} />
                </Show>
            </MenuBarSubmenu>

            <MenuBarSubmenu label="Help" icon={RiSystemQuestionLine}>
                <MenuBarItem
                    label="Visit GitHub"
                    icon={RiLogosGithubFill}
                    onClick={() =>
                        window.open("https://github.com/adamwych/materializer", "_blank")
                    }
                />
                <MenuBarItem
                    label="Report an Issue"
                    icon={RiSystemAlarmWarningFill}
                    onClick={() =>
                        window.open("https://github.com/adamwych/materializer/issues", "_blank")
                    }
                />
            </MenuBarSubmenu>
        </MenuBar>
    );
}

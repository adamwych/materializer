import { createSignal, Show } from "solid-js";
import MenuBarItem from "./components/menu-bar/item.tsx";
import MenuBar from "./components/menu-bar/menu-bar.tsx";
import MenuBarSubmenu from "./components/menu-bar/submenu.tsx";
import ExportDialog from "./export-dialog.tsx";
import OpenMaterialDialog from "./app/open-dialog/open-dialog.tsx";
import { useWorkspaceContext } from "./workspace-context";
import {
    RiDocumentFileLine,
    RiLogosGithubFill,
    RiSystemAlarmWarningFill,
    RiSystemQuestionFill,
} from "solid-icons/ri";

export default function AppMenuBar() {
    const workspaceContext = useWorkspaceContext()!;
    const [openDialogVisible, setOpenDialogVisible] = createSignal(false);
    const [exportDialogVisible, setExportDialogVisible] = createSignal(false);

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
                <MenuBarItem label="Export..." onClick={() => setExportDialogVisible(true)} />
            </MenuBarSubmenu>

            <MenuBarSubmenu label="Help" icon={RiSystemQuestionFill}>
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

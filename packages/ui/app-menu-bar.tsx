import {
    RiDocumentFileLine,
    RiLogosGithubFill,
    RiSystemAlarmWarningFill,
    RiSystemQuestionLine,
} from "solid-icons/ri";
import { Show } from "solid-js";
import { useWorkspaceStore } from "../stores/workspace.ts";
import { createEmptyMaterial } from "../types/material.ts";
import { useDialogsStore } from "./components/dialog/store.ts";
import MenuBar from "./components/menuBar/menu-bar.tsx";
import MenuBarSubmenuItem from "./components/menuBar/submenu-item.tsx";
import MenuBarSubmenu from "./components/menuBar/submenu.tsx";
import ExportDialog from "./export/export-dialog.tsx";

export default function AppMenuBar() {
    const workspace = useWorkspaceStore()!;
    const dialogs = useDialogsStore()!;

    return (
        <MenuBar>
            <MenuBarSubmenu label="File" icon={RiDocumentFileLine}>
                <MenuBarSubmenuItem
                    label="New"
                    onClick={() => workspace.addMaterial(createEmptyMaterial())}
                />

                <Show when={workspace.getActiveMaterial()}>
                    <MenuBarSubmenuItem
                        label="Export..."
                        onClick={() => dialogs.show(() => <ExportDialog />)}
                    />
                </Show>
            </MenuBarSubmenu>

            <MenuBarSubmenu label="Help" icon={RiSystemQuestionLine}>
                <MenuBarSubmenuItem
                    label="Visit GitHub"
                    icon={RiLogosGithubFill}
                    onClick={() =>
                        window.open("https://github.com/adamwych/materializer", "_blank")
                    }
                />
                <MenuBarSubmenuItem
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

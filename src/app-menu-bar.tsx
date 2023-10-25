import MenuBar from "./components/menu-bar/menu-bar.tsx";
import MenuBarItem from "./components/menu-bar/item.tsx";
import { createSignal, Show } from "solid-js";
import ExportDialog from "./export-dialog.tsx";
import MenuBarSubmenu from "./components/menu-bar/submenu.tsx";

export default function AppMenuBar() {
    const [exportDialogVisible, setExportDialogVisible] = createSignal(false);

    return (
        <MenuBar>
            <Show when={exportDialogVisible()}>
                <ExportDialog onClose={() => setExportDialogVisible(false)} />
            </Show>

            <MenuBarSubmenu label="File">
                <MenuBarItem label="New" />
                <MenuBarItem label="Open" />
                <MenuBarItem label="Save" />
                <MenuBarItem label="Save as" />
                <MenuBarItem
                    label="Export"
                    onClick={() => setExportDialogVisible(true)}
                />
            </MenuBarSubmenu>
            <MenuBarSubmenu label="Help" />
        </MenuBar>
    );
}

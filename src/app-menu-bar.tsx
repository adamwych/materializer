/* @refresh reload */
import "./styles.scss";
import UIMenuBar from "./components/menu-bar/menu-bar.tsx";
import UIMenuBarItem from "./components/menu-bar/item.tsx";
import {createSignal, Show} from "solid-js";
import UIExportDialog from "./export-dialog.tsx";
import UIMenuBarSubmenu from "./components/menu-bar/submenu.tsx";

export default function UIAppMenuBar() {
    const [exportDialogVisible, setExportDialogVisible] = createSignal(false);

    return (
        <UIMenuBar>
            <Show when={exportDialogVisible()}>
                <UIExportDialog onClose={() => setExportDialogVisible(false)} />
            </Show>

            <UIMenuBarSubmenu label="File">
                <UIMenuBarItem label="New" />
                <UIMenuBarItem label="Open" />
                <UIMenuBarItem label="Save" />
                <UIMenuBarItem label="Save as" />
                <UIMenuBarItem
                    label="Export"
                    onClick={() => setExportDialogVisible(true)}
                />
            </UIMenuBarSubmenu>
            <UIMenuBarSubmenu label="Help" />
        </UIMenuBar>
    );
}

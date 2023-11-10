import { RiLogosGithubFill, RiSystemAlarmWarningFill, RiSystemQuestionLine } from "solid-icons/ri";
import AppFileMenuBar from "./app-file-menu-bar.tsx";
import AppOptionsMenuBar from "./app-options-menu-bar.tsx";
import MenuBar from "./components/menuBar/menu-bar.tsx";
import MenuBarSubmenuItem from "./components/menuBar/submenu-item.tsx";
import MenuBarSubmenu from "./components/menuBar/submenu.tsx";

export default function AppMenuBar() {
    return (
        <MenuBar>
            <AppFileMenuBar />
            <AppOptionsMenuBar />

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

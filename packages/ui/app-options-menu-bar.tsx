import { RiSystemCheckLine, RiSystemCloseLine, RiSystemSettings2Line } from "solid-icons/ri";
import { usePreferencesStore } from "../stores/preferences.ts";
import MenuBarSubmenuItem from "./components/menuBar/submenu-item.tsx";
import MenuBarSubmenu from "./components/menuBar/submenu.tsx";

export default function AppOptionsMenuBar() {
    const preferences = usePreferencesStore()!;

    return (
        <MenuBarSubmenu label="Options" icon={RiSystemSettings2Line} minWidth="350px">
            <MenuBarSubmenuItem
                label="Confirm before closing"
                hint="Show a confirmation dialog before closing if there are unsaved changes."
                icon={preferences.warnIfNotSaved ? RiSystemCheckLine : RiSystemCloseLine}
                autoClose={false}
                onClick={() => (preferences.warnIfNotSaved = !preferences.warnIfNotSaved)}
            />
        </MenuBarSubmenu>
    );
}

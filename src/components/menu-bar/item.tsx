import { useMenuBarContext } from "./context.ts";

interface Props {
    label: string;
    shortcut?: string;

    onClick?(): void;
}

export default function MenuBarItem(props: Props) {
    const context = useMenuBarContext();

    function onClick() {
        props.onClick?.();
        context?.closeMenu();
    }

    return (
        <div class="px-3 py-2 text-sm hover:bg-gray-200 active:bg-gray-300" onClick={onClick}>
            <div class="flex items-center justify-between">
                <span>{props.label}</span>
                <span class="text-xs text-gray-700">{props.shortcut}</span>
            </div>
        </div>
    );
}

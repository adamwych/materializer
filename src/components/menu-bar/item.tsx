import { useMenuBarContext } from "./context.ts";

interface Props {
    label: string;

    onClick?(): void;
}

export default function MenuBarItem(props: Props) {
    const context = useMenuBarContext();

    function onClick() {
        props.onClick?.();
        context?.closeMenu();
    }

    return (
        <div class="px-3 py-2 text-sm hover:bg-gray-300 active:bg-gray-200" onClick={onClick}>
            {props.label}
        </div>
    );
}

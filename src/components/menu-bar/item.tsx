import { useMenuBarContext } from "./context.ts";

interface Props {
    label: string;

    onClick?(): void;
}

export default function UIMenuBarItem(props: Props) {
    const context = useMenuBarContext();

    function onClick() {
        props.onClick?.();
        context?.closeMenu();
    }

    return (
        <div
            class="px-3 py-2 hover:bg-gray-300-0 active:bg-gray-200-0"
            onClick={onClick}
        >
            {props.label}
        </div>
    );
}

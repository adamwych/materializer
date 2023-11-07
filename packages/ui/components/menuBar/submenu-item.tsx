import { useEventContext } from "../eventContext.ts";
import { IconTypes } from "solid-icons";

type Props = {
    label: string;
    icon?: IconTypes;
    shortcut?: string;

    onClick?(): void;
};

export default function MenuBarSubmenuItem(props: Props) {
    const events = useEventContext();
    const IconComponent = props.icon;

    function onClick() {
        props.onClick?.();
        events?.emit("close");
    }

    return (
        <div
            data-testid="menuBarSubmenuItem"
            class="px-3 py-2 text-sm hover:bg-gray-200 active:bg-gray-300"
            onClick={onClick}
        >
            <div class="flex items-center justify-between">
                <span class="flex items-center gap-2">
                    {IconComponent && <IconComponent size={16} />}
                    <span>{props.label}</span>
                </span>
                <span class="text-xs text-gray-700">{props.shortcut}</span>
            </div>
        </div>
    );
}

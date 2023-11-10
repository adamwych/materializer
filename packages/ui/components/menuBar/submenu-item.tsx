import { Dynamic, Show } from "solid-js/web";
import { useEventContext } from "../eventContext.ts";
import { IconTypes } from "solid-icons";

type Props = {
    label: string;
    hint?: string;
    icon?: IconTypes;
    shortcut?: string;
    autoClose?: boolean;

    onClick?(): void;
};

export default function MenuBarSubmenuItem(props: Props) {
    const events = useEventContext();
    const autoClose = () => props.autoClose ?? true;

    function onClick() {
        props.onClick?.();

        if (autoClose()) {
            events?.emit("close");
        }
    }

    return (
        <div
            data-testid="menuBarSubmenuItem"
            class="px-3 py-2 text-sm hover:bg-gray-200 active:bg-gray-300"
            onClick={onClick}
        >
            <div class="flex items-center justify-between">
                <span class="flex items-center gap-4">
                    <Show when={props.icon}>
                        <Dynamic component={props.icon} size={16} />
                    </Show>
                    <div>
                        <div>{props.label}</div>

                        <Show when={props.hint}>
                            <div class="text-gray-800 mt-1">{props.hint}</div>
                        </Show>
                    </div>
                </span>
                <span class="text-xs text-gray-700">{props.shortcut}</span>
            </div>
        </div>
    );
}

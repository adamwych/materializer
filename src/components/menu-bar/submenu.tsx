import { Component, createSignal, JSX, Show } from "solid-js";
import { MenuBarContextProvider } from "./context.ts";

interface Props {
    label: string;
    icon?: Component;
    children?: JSX.Element;
}

export default function MenuBarSubmenu(props: Props) {
    const IconComponent = props.icon;
    const [open, setOpen] = createSignal(false);

    return (
        <MenuBarContextProvider onClose={() => setOpen(false)}>
            <div class="relative">
                <div
                    class="px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-300 active:bg-gray-200"
                    onClick={() => setOpen((open) => !open)}
                >
                    {IconComponent && <IconComponent />}
                    <span>{props.label}</span>
                </div>

                <Show when={open()}>
                    <div
                        class="absolute z-10 animate-fade-scale-in origin-top-left bg-gray-100 border border-gray-300 rounded-md m-1 overflow-hidden"
                        style={{ width: "150px" }}
                    >
                        {props.children}
                    </div>
                </Show>
            </div>
        </MenuBarContextProvider>
    );
}

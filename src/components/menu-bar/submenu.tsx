import { createSignal, JSX, Show } from "solid-js";
import { UIMenuBarContextProvider } from "./context.ts";

interface Props {
    label: string;
    children?: JSX.Element;
}

export default function UIMenuBarSubmenu(props: Props) {
    const [open, setOpen] = createSignal(false);

    return (
        <UIMenuBarContextProvider onClose={() => setOpen(false)}>
            <div class="relative">
                <div
                    class="px-3 py-2 hover:bg-gray-300-0 active:bg-gray-200-0"
                    onClick={() => setOpen((open) => !open)}
                >
                    {props.label}
                </div>

                <Show when={open()}>
                    <div
                        class="absolute z-10 bg-gray-400-0 shadow-lg"
                        style={{ width: "144px" }}
                    >
                        {props.children}
                    </div>
                </Show>
            </div>
        </UIMenuBarContextProvider>
    );
}

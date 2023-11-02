import { Component, createSignal, createUniqueId, JSX, Show } from "solid-js";
import { MenuBarContextProvider } from "./context.ts";
import { DocumentEventListener } from "@solid-primitives/event-listener";
import hasParentWithCondition from "../../utils/hasParentWithCondition.ts";

interface Props {
    label: string;
    icon?: Component<{ size: number }>;
    children?: JSX.Element;
}

export default function MenuBarSubmenu(props: Props) {
    const id = createUniqueId();
    const IconComponent = props.icon;
    const [open, setOpen] = createSignal(false);

    function onDocumentMouseDown(ev: MouseEvent) {
        const targetInsideSubmenu = hasParentWithCondition(
            ev.target as Element,
            (element) => element.getAttribute("data-submenu-id") === id,
        );

        if (!targetInsideSubmenu) {
            setOpen(false);
        }
    }

    return (
        <MenuBarContextProvider onClose={() => setOpen(false)}>
            <div data-submenu-id={id} class="relative">
                <div
                    class={`px-3 py-2 text-sm flex items-center gap-2 ${
                        open() ? "bg-gray-200" : "hover:bg-gray-300 active:bg-gray-200"
                    }`}
                    onClick={() => setOpen((open) => !open)}
                >
                    {IconComponent && <IconComponent size={16} />}
                    <span>{props.label}</span>
                </div>

                <Show when={open()}>
                    <DocumentEventListener onMousedown={onDocumentMouseDown} />

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

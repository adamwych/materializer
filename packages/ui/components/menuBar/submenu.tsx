import { DocumentEventListener } from "@solid-primitives/event-listener";
import { createSignal, ParentProps, Show } from "solid-js";
import cn from "../../../utils/cn.ts";
import { EventContextProvider } from "../eventContext.ts";
import hasParentWithCondition from "../../../utils/hasParentWithCondition.ts";
import { IconTypes } from "solid-icons";

type Props = {
    label: string;
    icon?: IconTypes;
};

export default function MenuBarSubmenu(props: ParentProps<Props>) {
    let rootElement: HTMLDivElement;
    const IconComponent = props.icon;
    const [open, setOpen] = createSignal(false);

    function onItemEvent(eventName: string) {
        if (eventName === "close") {
            setOpen(false);
        }
    }

    function onDocumentMouseDown(ev: MouseEvent) {
        const clickedInsideSubmenu = hasParentWithCondition(
            ev.target as Element,
            (element) => element === rootElement,
        );

        if (!clickedInsideSubmenu) {
            setOpen(false);
        }
    }

    return (
        <div ref={rootElement!} data-testid="menuBarSubmenu" class="relative">
            <div
                data-testid="menuBarSubmenuButton"
                class={cn(
                    "flex items-center gap-2",
                    "px-3 py-2.5",
                    "text-sm",
                    open() ? "bg-gray-200" : "hover:bg-gray-300 active:bg-gray-200",
                )}
                onClick={() => setOpen((open) => !open)}
            >
                {IconComponent && <IconComponent size={16} />}
                <span>{props.label}</span>
            </div>

            <Show when={open()}>
                <DocumentEventListener onMousedown={onDocumentMouseDown} />

                <div
                    class={cn(
                        "absolute overflow-hidden w-[150px]",
                        "bg-gray-100",
                        "border border-gray-300",
                        "rounded-md m-1",
                        "animate-fade-scale-in origin-top-left",
                        "z-menubar",
                    )}
                >
                    <EventContextProvider handle={onItemEvent}>
                        {props.children}
                    </EventContextProvider>
                </div>
            </Show>
        </div>
    );
}

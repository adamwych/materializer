import { DocumentEventListener } from "@solid-primitives/event-listener";
import { RiArrowsArrowDropDownLine } from "solid-icons/ri";
import { ParentProps, Show, createSignal } from "solid-js";
import cn from "../../../utils/cn";
import hasParentWithCondition from "../../../utils/hasParentWithCondition";
import { EventContextProvider } from "../eventContext";
import Button, { ButtonProps } from "./button";

export default function MenuButton(props: ParentProps<Omit<ButtonProps, "onClick">>) {
    const [open, setOpen] = createSignal(false);
    let rootElement: HTMLDivElement;

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
        <div class="relative" ref={rootElement!}>
            <Button {...props} hold={open()} onClick={() => setOpen((v) => !v)}>
                <RiArrowsArrowDropDownLine size={16} class="-mx-1" />
            </Button>

            <Show when={open()}>
                <DocumentEventListener onMousedown={onDocumentMouseDown} />

                <div
                    class={cn(
                        "absolute right-0 overflow-hidden",
                        "bg-gray-100 min-w-[100px]",
                        "border border-gray-300",
                        "rounded-md mt-1",
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

import { DocumentEventListener } from "@solid-primitives/event-listener";
import { RiArrowsArrowDropDownLine } from "solid-icons/ri";
import { Show, createSignal } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import hasParentWithCondition from "../../../utils/hasParentWithCondition.ts";
import { SelectContextProvider } from "./context.ts";

type Props<V> = {
    children: JSX.Element;
    value: V;
    label: string;
    onChange(value: V): void;
    onFocus?(): void;
    onBlur?(): void;
};

export default function Select<V>(props: Props<V>) {
    const [optionsVisible, setOptionsVisible] = createSignal(false);
    let rootElement: HTMLDivElement;

    function open() {
        setOptionsVisible(true);
        props.onFocus?.();
    }

    function close() {
        setOptionsVisible(false);
        props.onBlur?.();
    }

    function toggle() {
        if (optionsVisible()) {
            close();
        } else {
            open();
        }
    }

    function onDocumentMouseDown(ev: MouseEvent) {
        const clickedInsideSelect = hasParentWithCondition(
            ev.target as Element,
            (element) => element === rootElement,
        );

        if (!clickedInsideSelect) {
            close();
        }
    }

    return (
        <div ref={rootElement!} class="relative w-full">
            <div
                class={`bg-gray-0 active:bg-gray-100 border border-gray-200 h-[35px] ${
                    optionsVisible() ? "rounded-t-md" : "rounded-md"
                }`}
                onClick={toggle}
            >
                <div class="p-2 flex items-center gap-4 justify-between">
                    <span class="text-sm">{props.label}</span>
                    <RiArrowsArrowDropDownLine size={20} />
                </div>
            </div>

            <SelectContextProvider onChange={props.onChange} onClose={close}>
                <Show when={optionsVisible()}>
                    <DocumentEventListener onMousedown={onDocumentMouseDown} />

                    <div class="absolute w-full z-10 border border-gray-200 -mt-[1px] rounded-b-md overflow-hidden">
                        {props.children}
                    </div>
                </Show>
            </SelectContextProvider>
        </div>
    );
}

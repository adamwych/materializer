import { RiArrowsArrowDropDownLine } from "solid-icons/ri";
import { ParentProps, Show, createSignal } from "solid-js";
import SelectBody from "./body.tsx";

type Props<V> = {
    value: V;
    label: string;
    onChange(value: V): void;
    onFocus?(): void;
    onBlur?(): void;
};

export default function Select<V>(props: ParentProps<Props<V>>) {
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

    return (
        <div ref={rootElement!} class="relative w-full">
            <div
                class={`bg-gray-0 active:bg-gray-100 border border-gray-200 h-[35px] ${
                    optionsVisible() ? "rounded-t-md" : "rounded-md"
                }`}
                onMouseDown={toggle}
            >
                <div class="p-2 flex items-center gap-4 justify-between">
                    <span class="text-sm">{props.label}</span>
                    <RiArrowsArrowDropDownLine size={20} />
                </div>
            </div>

            <Show when={optionsVisible()}>
                <SelectBody buttonElement={rootElement!} onChange={props.onChange} onClose={close}>
                    {props.children}
                </SelectBody>
            </Show>
        </div>
    );
}

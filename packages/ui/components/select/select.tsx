import { Show, createSignal } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { RiArrowsArrowDropDownLine } from "solid-icons/ri";
import { SelectContextProvider } from "./context.ts";

interface Props<V> {
    children: JSX.Element;
    value: V;
    label: string;
    onChange(value: V): void;
}

export default function Select<V>(props: Props<V>) {
    const [optionsVisible, setOptionsVisible] = createSignal(false);

    return (
        <div class="relative w-full">
            <div
                class={`bg-gray-0 active:bg-gray-100 border border-gray-200 h-[35px] ${
                    optionsVisible() ? "rounded-t-md" : "rounded-md"
                }`}
                onClick={() => setOptionsVisible((v) => !v)}
            >
                <div class="p-2 flex items-center gap-4 justify-between">
                    <span class="text-sm">{props.label}</span>
                    <RiArrowsArrowDropDownLine size={20} />
                </div>
            </div>

            <SelectContextProvider
                onChange={props.onChange}
                onClose={() => setOptionsVisible(false)}
            >
                <Show when={optionsVisible()}>
                    <div class="absolute w-full z-10 border border-gray-200 -mt-[1px] rounded-b-md overflow-hidden">
                        {props.children}
                    </div>
                </Show>
            </SelectContextProvider>
        </div>
    );
}

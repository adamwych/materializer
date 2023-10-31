import { Show, createSignal } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { RiArrowsArrowDropDownLine } from "solid-icons/ri";
import { SelectContextProvider } from "./context";

interface Props {
    children: JSX.Element;
    value: any;
    label: string;
    onChange(value: any): void;
}

export default function Select(props: Props) {
    const [optionsVisible, setOptionsVisible] = createSignal(false);

    return (
        <div class="relative w-full">
            <div
                class="bg-gray-100 hover:bg-gray-300 active:bg-gray-400 rounded-sm"
                onClick={() => setOptionsVisible((v) => !v)}
            >
                <div class="p-2 px-3 flex items-center gap-4 justify-between">
                    <span class="text-sm">{props.label}</span>
                    <RiArrowsArrowDropDownLine size={20} />
                </div>
            </div>

            <SelectContextProvider
                onChange={props.onChange}
                onClose={() => setOptionsVisible(false)}
            >
                <Show when={optionsVisible()}>
                    <div class="absolute w-full z-10">{props.children}</div>
                </Show>
            </SelectContextProvider>
        </div>
    );
}

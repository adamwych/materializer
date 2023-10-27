import { For, JSX } from "solid-js";
import { Portal } from "solid-js/web";
import Button from "../button/button.tsx";

interface Props {
    title: string;
    buttons?: Array<{
        label: string;
        onClick: () => void;
    }>;
    children?: JSX.Element;
}

export default function Dialog(props: Props) {
    return (
        <Portal>
            <div
                class="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50"
                style={{ background: "rgba(0, 0, 0, 0.5)" }}
            >
                <div class="bg-gray-400 w-[320px]">
                    <div class="p-4">{props.title}</div>
                    <div class="p-4">{props.children}</div>
                    <div class="p-4 flex gap-4">
                        <For each={props.buttons}>
                            {(button) => <Button onClick={button.onClick}>{button.label}</Button>}
                        </For>
                    </div>
                </div>
            </div>
        </Portal>
    );
}

import { For, JSX, Show } from "solid-js";
import { Portal } from "solid-js/web";
import Button from "../button/button.tsx";
import { RiSystemCloseFill } from "solid-icons/ri";

interface Props {
    title: string;
    buttons?: Array<{
        label: string;
        disabled?: boolean;
        onClick: () => void;
    }>;
    children?: JSX.Element;
    onClose: () => void;
}

export default function Dialog(props: Props) {
    const buttons = () => props.buttons ?? [];

    return (
        <Portal>
            <div class="fixed top-0 left-0 w-full h-full flex items-center justify-center pointer-events-auto z-dialog">
                <div
                    class="absolute top-0 left-0 w-full h-full animate-fade-in"
                    style={{ background: "rgba(0, 0, 0, 0.5)" }}
                    onClick={props.onClose}
                />
                <div class="w-[30vw] min-w-[560px] max-w-[750px] bg-gray-100 border border-gray-300 rounded-md shadow-md animate-fade-scale-in animation-delay-sm">
                    <div class="p-4 border-b border-gray-300 flex items-center justify-between">
                        <span class="font-semibold">{props.title}</span>
                        <RiSystemCloseFill class="text-lg" onClick={props.onClose} />
                    </div>

                    <div class="p-4">{props.children}</div>

                    <Show when={buttons().length > 0}>
                        <div class="p-4 flex justify-center gap-4">
                            <For each={buttons()}>
                                {(button) => (
                                    <Button disabled={button.disabled} onClick={button.onClick}>
                                        {button.label}
                                    </Button>
                                )}
                            </For>
                        </div>
                    </Show>
                </div>
            </div>
        </Portal>
    );
}

import { RiSystemCloseFill } from "solid-icons/ri";
import { JSX, ParentProps, Show } from "solid-js";
import cn from "../../../utils/cn.ts";
import { useDialogsStore } from "./store.ts";

type Props = {
    title: string;
    buttons?: Array<JSX.Element>;
};

export default function Dialog(props: ParentProps<Props>) {
    const dialogs = useDialogsStore()!;
    const buttons = () => props.buttons ?? [];

    return (
        <div
            class={cn(
                "w-[30vw] min-w-[560px] max-w-[750px]",
                "bg-gray-100",
                "border border-gray-300",
                "rounded-md shadow-md",
                "animate-fade-scale-in animation-delay-sm",
            )}
        >
            <div class="flex items-center justify-between p-4 border-b border-gray-300">
                <span class="font-semibold">{props.title}</span>
                <RiSystemCloseFill onClick={() => dialogs.pop()} />
            </div>

            <div class="p-4">{props.children}</div>

            <Show when={buttons().length > 0}>
                <div class="flex justify-center gap-4 p-4">{buttons()}</div>
            </Show>
        </div>
    );
}

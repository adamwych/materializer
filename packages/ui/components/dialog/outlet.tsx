import { Show } from "solid-js";
import cn from "../../../utils/cn.ts";
import { useDialogsStore } from "./store.ts";

export default function DialogsOutlet() {
    const { dialogs, pop } = useDialogsStore()!;
    const dialog = () => Array.from(dialogs)[dialogs.size - 1];

    return (
        <Show when={dialog()}>
            <div
                class={cn(
                    "fixed top-0 left-0",
                    "w-full h-full",
                    "flex items-center justify-center",
                    "z-dialog",
                )}
            >
                <div
                    class={cn(
                        "absolute top-0 left-0",
                        "w-full h-full",
                        "bg-black bg-opacity-50",
                        "animate-fade-in",
                    )}
                    onClick={() => pop()}
                />

                {dialog()!.renderer()}
            </div>
        </Show>
    );
}

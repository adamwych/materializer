import { For } from "solid-js";
import { useDialogsContext } from "./context";

export default function DialogsContainer() {
    const context = useDialogsContext();
    if (!context) {
        throw new Error("DialogsContainer can only be used within a DialogsProvider.");
    }

    return (
        <div class="fixed top-0 left-0 w-full h-full pointer-events-none z-dialog">
            <For each={Array.from(context.dialogs.values())}>{(renderer) => renderer()}</For>
        </div>
    );
}

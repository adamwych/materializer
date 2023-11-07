import { For } from "solid-js";
import { useSnackbar } from "./context.ts";
import SnackbarNotification from "./notification.tsx";

export default function SnackbarsContainer() {
    const context = useSnackbar();
    if (!context) {
        throw new Error("SnackbarsContainer can only be used within a SnackbarProvider.");
    }

    return (
        <div class="fixed bottom-0 left-0 m-4 z-snackbars flex flex-col gap-2">
            <For each={context.notifications}>{(info) => <SnackbarNotification info={info} />}</For>
        </div>
    );
}

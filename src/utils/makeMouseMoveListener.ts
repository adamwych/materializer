import { onCleanup } from "solid-js";

export default function makeMouseMoveListener(callback: (ev: MouseEvent) => void) {
    function registerListeners(ev: MouseEvent) {
        callback(ev);
        window.addEventListener("mousemove", callback);
        window.addEventListener("mouseup", removeListeners);
    }

    function removeListeners() {
        window.removeEventListener("mousemove", callback);
        window.removeEventListener("mouseup", removeListeners);
    }

    onCleanup(() => {
        removeListeners();
    });

    return registerListeners;
}

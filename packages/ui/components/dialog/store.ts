import { createContextProvider } from "@solid-primitives/context";
import { ReactiveSet } from "@solid-primitives/set";
import { JSX, createUniqueId } from "solid-js";

/** Function that renders the dialog element. */
export type DialogRenderFn = () => JSX.Element;

export type DialogRef = {
    /**
     * Closes the dialog associated with this ref.
     */
    close(): void;
};

/**
 * Provides app-wide possibility to show and hide dialogs.
 *
 * @example
 * ```tsx
 * const dialogs = useDialogsStore();
 *
 * function onClick() {
 *     dialogs.show(() => <MyDialog />);
 * }
 *
 * return <button onClick={onClick}>Show a dialog!</button>;
 * ```
 */
export const [DialogsProvider, useDialogsStore] = createContextProvider(() => {
    const dialogs = new ReactiveSet<{ id: string; renderer: DialogRenderFn }>();

    return {
        /**
         * Shows a dialog.
         * Only one dialog can be visible at once, if another dialog is
         * already visible, it will be replaced by this dialog.
         *
         * Returns a {@link DialogRef} which can be used to close
         * the dialog later.
         *
         * @param renderer Function that renders the dialog.
         */
        show(renderer: DialogRenderFn): DialogRef {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const store = this;
            const id = createUniqueId();
            const ref: DialogRef = {
                close() {
                    store.close(id);
                },
            };

            dialogs.add({ id, renderer });
            return ref;
        },

        /**
         * Closes dialog by given ID.
         *
         * @param id ID of the dialog to close.
         */
        close(id: string) {
            const dialog = Array.from(dialogs).find((x) => x.id === id);
            if (dialog) {
                dialogs.delete(dialog);
            }
        },

        /**
         * Closes last added dialog.
         */
        pop() {
            const lastDialog = Array.from(dialogs)[dialogs.size - 1];
            if (lastDialog) {
                dialogs.delete(lastDialog);
            }
        },

        dialogs,
    };
});

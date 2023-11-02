import { ContextProviderProps, createContextProvider } from "@solid-primitives/context";
import { ReactiveMap } from "@solid-primitives/map";
import { JSX, createUniqueId } from "solid-js";

export type DialogRenderFn = () => JSX.Element;

export type DialogRef = {
    close(): void;
};

export interface IDialogsProvider {
    show(fn: () => JSX.Element): DialogRef;
    close(id: string): void;
    dialogs: ReactiveMap<string, DialogRenderFn>;
}

/**
 * @example
 * ```tsx
 * const dialogs = useDialogsContext();
 * function onClick() {
 *     const ref = dialogs.show(() => (
 *         <Dialog
 *             onClose={() => ref.close()}
 *         />
 *     ));
 * }
 * return <button onClick={onClick}>Show dialog!</button>;
 * ```
 */
export const [DialogsProvider, useDialogsContext] = createContextProvider<
    IDialogsProvider,
    ContextProviderProps
>(() => {
    const dialogs = new ReactiveMap<string, DialogRenderFn>();

    return {
        show(fn: DialogRenderFn): DialogRef {
            const id = createUniqueId();

            dialogs.set(id, fn);

            return {
                close() {
                    dialogs.delete(id);
                },
            };
        },

        close(id: string) {
            dialogs.delete(id);
        },

        dialogs,
    };
});

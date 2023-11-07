import { createContextProvider } from "@solid-primitives/context";
import { makeEventListener } from "@solid-primitives/event-listener";
import { createMousePosition } from "@solid-primitives/mouse";
import { ReactiveSet } from "@solid-primitives/set";
import { EDITOR_ELEMENT_ID } from "../ui/editor/consts";
import hasParentWithCondition from "../utils/hasParentWithCondition";

/**
 * An event emitted when a registered shortcut is used by the user.
 */
export type ShortcutEvent = {
    pointerX: number;
    pointerY: number;
};

export type ShortcutInfo = {
    /** Name of the key that must be pressed to invoke this shortcut. */
    key: string;

    /** Whether the control key must be pressed to invoke this shorcut. */
    ctrl: boolean;

    /**
     * Scope in which this shortcut is available.
     * Shortcuts registered in the `app` scope are also available in
     * the `editor` scope, but in case of a conflict, the editor
     * shortcut will be prioritized.
     *
     * Editor shortcuts work only when the user is hovering their pointer
     * over the graph.
     */
    scope: "app" | "editor";

    /** Function to call when this shortcut is used. */
    handler(ev: ShortcutEvent): void;
};

type Props = {
    value?: Array<ShortcutInfo>;
};

export const [ShortcutsProvider, useShortcutsStore] = createContextProvider(({ value }: Props) => {
    const shortcuts = new ReactiveSet<ShortcutInfo>(value);
    const mousePosition = createMousePosition();

    makeEventListener(window, "keydown", (ev) => {
        if (ev.repeat) {
            return;
        }

        const shortcut = Array.from(shortcuts).find(
            (info) => info.key === ev.key && info.ctrl === ev.ctrlKey,
        );

        if (!shortcut) {
            return;
        }

        // Editor shortcuts should work only when the user is hovering their mouse over the graph.
        if (shortcut.scope === "editor") {
            // Ignore editor shortcuts if an input is focused.
            if (document.querySelector(":focus")) {
                return;
            }

            const targetElementInEditor = hasParentWithCondition(
                document.elementFromPoint(mousePosition.x, mousePosition.y),
                (e) => e.id === EDITOR_ELEMENT_ID,
            );

            if (!targetElementInEditor) {
                return;
            }
        }

        ev.stopPropagation();
        shortcut.handler({ pointerX: mousePosition.x, pointerY: mousePosition.y });
    });

    return {
        /**
         * Registers a new shortcut in this provider.
         * Shortcuts are automatically deleted once this
         * provider is removed from the component tree.
         *
         * @param info
         */
        add(info: ShortcutInfo) {
            shortcuts.add(info);
        },
    };
});

export type IShortcutsHandler = NonNullable<ReturnType<typeof useShortcutsStore>>;

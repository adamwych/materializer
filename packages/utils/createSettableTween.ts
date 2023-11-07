import { createSignal, createEffect, onCleanup, on, Accessor, Setter } from "solid-js";

// Adapted from https://github.com/solidjs-community/solid-primitives/blob/main/packages/tween/src/index.ts
// but also allows setting the tweened value manually in case you only want to tween in certain conditions.

/**
 * Creates a simple tween method.
 *
 * @param function Target to be modified
 * @param object Object representing the ease and duration
 * @returns Returns the tweening value
 *
 * @example
 * ```ts
 * const tweenedValue = createTween(myNumber, { duration: 500 });
 * ```
 */
export default function createSettableTween<T extends number>(
    target: () => T,
    { ease = (t: T) => t, duration = 100 },
): [Accessor<T>, Setter<T>] {
    const [start, setStart] = createSignal(performance.now());
    const [current, setCurrent] = createSignal<T>(target());
    createEffect(on(target, () => setStart(performance.now()), { defer: true }));
    createEffect(
        on([start, current], () => {
            const cancelId = requestAnimationFrame((t) => {
                const elapsed = t - (start() || 0) + 1;
                // @ts-ignore
                setCurrent((c) =>
                    elapsed < duration
                        ? (target() - c) * ease((elapsed / duration) as T) + c
                        : target(),
                );
            });
            onCleanup(() => cancelAnimationFrame(cancelId));
        }),
    );
    return [current, setCurrent];
}

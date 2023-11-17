import { onCleanup } from "solid-js";

type HTMLEventHandler<K extends keyof HTMLElementEventMap> = (ev: HTMLElementEventMap[K]) => void;

/**
 * Attaches an event listener to given node and its parent, recursively.
 *
 * @param node Node to start from.
 * @param eventName Name of the event to listen to.
 * @param eventHandler Function that handles the event.
 * @returns A function that clears all registered listeners.
 */
export default function makeNestedEventListener<K extends keyof HTMLElementEventMap>(
    node: HTMLElement,
    eventName: K,
    eventHandler: HTMLEventHandler<K>,
) {
    const listeners: Array<[HTMLElement, HTMLEventHandler<K>]> = [];

    while (node) {
        listeners.push([node, eventHandler]);
        node.addEventListener(eventName, eventHandler);
        node = node.parentElement!;
    }

    function clear() {
        listeners.forEach(([node, handler]) => {
            node.removeEventListener(eventName, handler);
        });
    }

    onCleanup(() => {
        clear();
    });

    return clear;
}

import {
    EventMapOf,
    TargetWithEventMap,
    makeEventListener,
} from "@solid-primitives/event-listener";

export default function makeDeferredEventListener<
    Target extends TargetWithEventMap,
    EventMap extends EventMapOf<Target>,
    EventType extends keyof EventMap,
>(target: Target, eventName: EventType, handler: (ev: EventMap[EventType]) => void) {
    let clear: Function | undefined;
    return [
        () => {
            clear = makeEventListener(target, eventName, handler);
        },
        () => {
            if (clear) {
                clear();
                clear = undefined;
            }
        },
    ];
}

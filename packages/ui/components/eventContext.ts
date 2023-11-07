import { createContextProvider } from "@solid-primitives/context";

export const [EventContextProvider, useEventContext] = createContextProvider(
    ({ handle }: { handle(eventName: string, data?: unknown): void }) => {
        return {
            emit(eventName: string, data?: unknown) {
                handle(eventName, data);
            },
        };
    },
);

import { createContextProvider } from "@solid-primitives/context";
import { Component } from "solid-js";
import { createStore, produce } from "solid-js/store";

export type SnackbarNotificationInfo = {
    type: "info" | "success" | "error";
    text: string;
    icon?: Component;
    duration?: number;
};

export const [SnackbarProvider, useSnackbar] = createContextProvider(() => {
    const [notifications, setNotifications] = createStore<Array<SnackbarNotificationInfo>>([]);

    return {
        push(info: SnackbarNotificationInfo) {
            setNotifications(
                produce((notifications) => {
                    notifications.push(info);
                }),
            );

            setTimeout(() => {
                setNotifications(
                    produce((notifications) => {
                        notifications.pop();
                    }),
                );
            }, info.duration ?? 1000);
        },

        notifications,
    };
});

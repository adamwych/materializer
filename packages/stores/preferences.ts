import { createContextProvider } from "@solid-primitives/context";
import { createStore, produce } from "solid-js/store";

export type Preferences = { warnIfNotSaved: boolean };

/** Name of the key under which the preferences are stored in the `localStorage`. */
const STORAGE_KEY = "app.preferences";
const DEFAULT_PREFERENCES: Preferences = {
    warnIfNotSaved: true,
};

function getInitialPreferences(): Preferences {
    try {
        const savedPreferences = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
        return { ...DEFAULT_PREFERENCES, ...savedPreferences };
    } catch (_) {
        return DEFAULT_PREFERENCES;
    }
}

export const [PreferencesStore, usePreferencesStore] = createContextProvider(() => {
    const [preferences, setPreferences] = createStore(getInitialPreferences());

    return {
        set<K extends keyof Preferences>(key: K, value: Preferences[K]) {
            return setPreferences(
                produce((preferences) => {
                    preferences[key] = value;
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
                }),
            );
        },

        get<K extends keyof Preferences>(key: K): Preferences[K] {
            return preferences[key];
        },

        set warnIfNotSaved(value: boolean) {
            this.set("warnIfNotSaved", value);
        },
        get warnIfNotSaved() {
            return this.get("warnIfNotSaved");
        },
    };
});

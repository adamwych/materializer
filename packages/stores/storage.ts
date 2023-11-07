import { createContextProvider } from "@solid-primitives/context";

export const [UserDataStorageProvider, useUserDataStore] = createContextProvider(() => {
    return {};
});

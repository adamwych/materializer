import { createContextProvider } from "@solid-primitives/context";
import UnsavedChangesDialog from "./app/unsaved-changes-dialog.tsx";
import { useDialogsContext } from "./components/dialog/context.ts";
import { ReactiveSet } from "@solid-primitives/set";

export enum NotSavedResolution {
    SaveChanges,
    CloseWithoutSaving,
}

export const [WorkspaceHistoryProvider, useWorkspaceHistory] = createContextProvider(() => {
    const dialogs = useDialogsContext()!;
    const changedMaterials = new ReactiveSet<string>();

    return {
        warnIfNotSaved(id: string, name: string): Promise<NotSavedResolution> {
            const hasUnsavedChanges = this.hasUnsavedChanges(id);
            if (hasUnsavedChanges) {
                return new Promise((resolve) => {
                    const ref = dialogs.show(() => (
                        <UnsavedChangesDialog
                            materialName={name}
                            onSave={() => {
                                ref.close();
                                resolve(NotSavedResolution.SaveChanges);
                            }}
                            onClose={() => {
                                ref.close();
                                resolve(NotSavedResolution.CloseWithoutSaving);
                            }}
                            onCancel={() => {
                                ref.close();
                            }}
                        />
                    ));
                });
            }

            return Promise.resolve(NotSavedResolution.CloseWithoutSaving);
        },

        markAsSaved(id: string) {
            changedMaterials.delete(id);
        },

        markAsChanged(id: string) {
            changedMaterials.add(id);
        },

        hasUnsavedChanges(id: string) {
            return changedMaterials.has(id);
        },
    };
});

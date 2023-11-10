import { createContextProvider } from "@solid-primitives/context";
import { ReactiveSet } from "@solid-primitives/set";
import { createStore, produce } from "solid-js/store";
import { useDialogsStore } from "../ui/components/dialog/store";
import { EditorHistoryStack } from "../ui/editor/canvas/interaction/history";
import UnsavedChangesDialog from "../ui/unsaved-changes-dialog";

export enum NotSavedResolution {
    SaveChanges,
    CloseWithoutSaving,
}

export const [WorkspaceHistoryProvider, useWorkspaceHistory] = createContextProvider(() => {
    const dialogs = useDialogsStore()!;
    const changedMaterials = new ReactiveSet<string>();
    const [editorStacks, setEditorStacks] = createStore<Record<string, EditorHistoryStack>>({});

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

        initializeEditorHistoryStack(materialId: string) {
            setEditorStacks(
                produce((state) => {
                    if (!(materialId in state)) {
                        state[materialId] = {
                            entries: [],
                            top: 0,
                        };
                    }
                }),
            );
        },

        setEditorHistoryStack(materialId: string, setter: (current: EditorHistoryStack) => void) {
            setEditorStacks(
                produce((state) => {
                    setter(state[materialId]);
                }),
            );
        },

        getEditorHistoryStack(materialId: string) {
            return editorStacks[materialId];
        },
    };
});

import { createContextProvider } from "@solid-primitives/context";
import { RiDeviceSave2Fill } from "solid-icons/ri";
import { createEffect, createSignal } from "solid-js";
import { createStore, produce, unwrap } from "solid-js/store";
import { MaterialGraphEdge } from "../material/graph";
import { Material } from "../material/material";
import { MaterialNode } from "../material/node";
import { useSnackbar } from "../ui/components/snackbar/context";
import { useUserDataStorage } from "./storage";
import { NotSavedResolution, useWorkspaceHistory } from "./workspace-history";
import { usePreferencesStore } from "./preferences";

export type WorkspaceClipboardState = {
    nodes: Array<MaterialNode>;
    edges: Array<MaterialGraphEdge>;
};

export const [WorkspaceProvider, useWorkspaceStore] = createContextProvider(() => {
    const snackbar = useSnackbar()!;
    const history = useWorkspaceHistory()!;
    const userDataStorage = useUserDataStorage()!;
    const preferences = usePreferencesStore()!;
    const [materials, setMaterials] = createStore<Array<Material>>([]);
    const [activeMaterialId, setActiveMaterialId] = createSignal<string>();

    createEffect(() => {
        if (preferences.warnIfNotSaved) {
            window.onbeforeunload = () => {
                const anyUnsavedChanges = materials.some((x) => history.hasUnsavedChanges(x.id));
                if (anyUnsavedChanges) {
                    return "You have unsaved changes.";
                }
            };
        } else {
            window.onbeforeunload = null;
        }
    });

    return {
        /**
         * Adds a material to the workspace and opens its editor tab.
         * Any further changes to this material must be made through the
         * `modifyMaterial` method.
         *
         * @param material Material to add.
         */
        addMaterial(material: Material) {
            const alreadyInWorkspace = materials.some((x) => x.id === material.id);
            if (!alreadyInWorkspace) {
                setMaterials(
                    produce((materials) => {
                        materials.push(material);
                    }),
                );

                history.initializeEditorHistoryStack(material.id);
            }

            setActiveMaterialId(material.id);
        },

        /**
         * Modifies a material by given ID.
         *
         * @param materialId ID of the material to modify.
         * @param setter A function that modifies the material.
         */
        modifyMaterial(materialId: string, setter: (current: Material) => void) {
            setMaterials(
                produce((materials) => {
                    const material = materials.find((x) => x.id === materialId);
                    if (material) {
                        const previousId = material.id;

                        setter(material);

                        if (material.id !== previousId) {
                            throw new Error("Changing material's ID is not allowed.");
                        }

                        history.markAsChanged(materialId);
                    }
                }),
            );
        },

        /**
         * Deletes material by given ID from the workspace.
         * If this material was currently being edited by the user, the
         * active tab will be changed to another material from this workspace.
         *
         * @param materialId ID of the material to delete.
         */
        deleteMaterial(materialId: string) {
            const material = materials.find((x) => x.id === materialId)!;

            history.warnIfNotSaved(material.id, material.name).then((resolution) => {
                if (resolution === NotSavedResolution.SaveChanges) {
                    userDataStorage.saveMaterial(unwrap(material));
                    history.markAsSaved(materialId);
                }

                if (this.isActiveMaterial(materialId)) {
                    const materialIndex = materials.findIndex((x) => x.id === materialId);

                    // If this is the last material in this workspace, then
                    // just close the editor.
                    if (materials.length === 1) {
                        setActiveMaterialId(undefined);
                    } else {
                        const closestMaterialIndex = materialIndex === 0 ? 1 : materialIndex - 1;
                        setActiveMaterialId(materials[closestMaterialIndex].id);
                    }
                }

                setMaterials((materials) => materials.filter((x) => x.id !== materialId));
            });
        },

        /**
         * Saves active material in local storage and shows a success notification.
         */
        saveActiveMaterial() {
            const activeMaterial = this.getActiveMaterial();
            if (activeMaterial) {
                userDataStorage.saveMaterial(unwrap(activeMaterial));
                snackbar.push({
                    type: "success",
                    text: "Material saved.",
                    icon: RiDeviceSave2Fill,
                    duration: 2000,
                });
                history.markAsSaved(activeMaterial.id);
            }
        },

        /**
         * Saves specified nodes and their edges in the clipboard.
         * Clipboard data is stored in the local storage so it can be shared
         * between multiple browser tabs.
         *
         * @param nodes Nodes to save.
         */
        saveNodesInClipboard(nodes: Array<MaterialNode>) {
            const material = this.getActiveMaterial()!;
            const state: WorkspaceClipboardState = {
                nodes: nodes.map((node) => structuredClone(unwrap(node))),
                edges: material.edges
                    .filter(
                        (edge) =>
                            nodes.some((node) => node.id === edge.from[0]) &&
                            nodes.some((node) => node.id === edge.to[0]),
                    )
                    .map((edge) => structuredClone(unwrap(edge))),
            };

            localStorage.setItem("clipboard", JSON.stringify(state));
        },

        getClipboardState() {
            return userDataStorage.readClipboardState();
        },

        getActiveMaterial(): Readonly<Material> | undefined {
            return materials.find((x) => x.id === activeMaterialId());
        },

        /**
         * Returns whether material by given ID is the active one.
         *
         * @param materialId
         * @returns
         */
        isActiveMaterial(materialId: string) {
            return activeMaterialId() === materialId;
        },

        /**
         * Returns a list of all materials within this workspace.
         * @returns
         */
        getMaterials(): ReadonlyArray<Material> {
            return materials;
        },
    };
});

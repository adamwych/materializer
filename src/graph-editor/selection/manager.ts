import { createContextProvider } from "@solid-primitives/context";
import createSingleSelectHandler from "./single-select.ts";
import createMultiSelectHandler from "./multi-select.tsx";

const [EditorSelectionManagerProvider, useEditorSelectionManager] =
    createContextProvider(() => {
        const multiSelectHandler = createMultiSelectHandler();
        const singleSelectHandler = createSingleSelectHandler();

        return {
            renderMultiselectBox() {
                return multiSelectHandler.renderMultiselectBox();
            },

            onMainAreaMouseDown(ev: MouseEvent) {
                multiSelectHandler.onMouseDown(ev);
            },

            onNodeMouseDown(ev: MouseEvent, nodeId: number) {
                if (multiSelectHandler.isNodeSelected(nodeId)) {
                    multiSelectHandler.onNodeMouseDown(ev);
                } else {
                    singleSelectHandler.onMouseDown(ev, nodeId);
                }
            },

            deselectAll() {
                multiSelectHandler.deselectAll();
                singleSelectHandler.deselectAll();
            },
        };
    });

export { EditorSelectionManagerProvider, useEditorSelectionManager };

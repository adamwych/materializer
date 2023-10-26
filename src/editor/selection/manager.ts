import { createContextProvider } from "@solid-primitives/context";
import createSingleSelectManager from "./single-select.ts";
import createMultiSelectManager from "./multi-select.tsx";

const [EditorSelectionManagerProvider, useEditorSelectionManager] = createContextProvider(() => {
    const multiSelect = createMultiSelectManager();
    const singleSelect = createSingleSelectManager();

    return {
        renderMultiselectBox() {
            return multiSelect.renderMultiselectBox();
        },

        onMainAreaMouseDown(ev: MouseEvent) {
            multiSelect.onMouseDown(ev);
        },

        onNodeMouseDown(ev: MouseEvent, nodeId: number) {
            if (multiSelect.isNodeSelected(nodeId)) {
                multiSelect.onNodeMouseDown(ev);
            } else {
                singleSelect.onMouseDown(ev, nodeId);
            }
        },

        deselectAll() {
            multiSelect.deselectAll();
            singleSelect.deselectAll();
        },
    };
});

export { EditorSelectionManagerProvider, useEditorSelectionManager };

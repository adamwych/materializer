import { createContextProvider } from "@solid-primitives/context";
import createSingleSelectManager from "./single-select.ts";
import createMultiSelectManager from "./multi-select.tsx";

const [EditorSelectionManagerProvider, useEditorSelectionManager] = createContextProvider(() => {
    const multiSelect = createMultiSelectManager();
    const singleSelect = createSingleSelectManager();

    return {
        renderSelectionRect() {
            return multiSelect.renderSelectionRect();
        },

        onMainAreaMouseDown(ev: MouseEvent) {
            multiSelect.onMainAreaMouseDown(ev);
        },

        onNodeMouseDown(ev: MouseEvent, nodeId: number) {
            if (ev.button !== 0) {
                return;
            }

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

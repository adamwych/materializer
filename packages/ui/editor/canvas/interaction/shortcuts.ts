import { useMaterialStore } from "../../../../stores/material";
import { useShortcutsStore } from "../../../../stores/shortcuts";
import { useEditorAddNodePopupRef } from "../../add-node-popup/ref";
import { useEditorSelectionManager } from "./selection";

/**
 * Registers editor-related shortcuts in the {@link ShortcutsHandler}.
 */
export default function registerEditorCanvasShortcuts() {
    const addNodePopupRef = useEditorAddNodePopupRef()!;
    const handler = useShortcutsStore()!;
    const selection = useEditorSelectionManager()!;
    const materialActions = useMaterialStore()!;

    handler.add({
        key: " ",
        ctrl: false,
        scope: "editor",
        handler: (ev) => {
            if (addNodePopupRef.isVisible()) {
                addNodePopupRef.hide();
            } else {
                addNodePopupRef.show(ev.pointerX, ev.pointerY);
            }
        },
    });

    handler.add({
        key: "Delete",
        ctrl: false,
        scope: "editor",
        handler: () => {
            const ids = [...selection.selectedNodes()];
            selection.clear();
            ids.forEach((id) => {
                materialActions.removeNode(id);
            });
        },
    });
}

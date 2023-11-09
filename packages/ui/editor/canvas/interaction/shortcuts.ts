import { useMaterialStore } from "../../../../stores/material";
import { useShortcutsStore } from "../../../../stores/shortcuts";
import { useWorkspaceStore } from "../../../../stores/workspace";
import { useEditorAddNodePopupRef } from "../../add-node-popup/ref";
import { useEditorCameraState } from "./camera";
import { useEditorSelectionManager } from "./selection";

/**
 * Registers editor-related shortcuts in the {@link ShortcutsHandler}.
 */
export default function registerEditorCanvasShortcuts() {
    const addNodePopupRef = useEditorAddNodePopupRef()!;
    const handler = useShortcutsStore()!;
    const selection = useEditorSelectionManager()!;
    const materialStore = useMaterialStore()!;
    const workspace = useWorkspaceStore()!;
    const cameraState = useEditorCameraState()!;

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
                materialStore.removeNode(id);
            });
        },
    });

    handler.add({
        key: "d",
        ctrl: true,
        scope: "editor",
        handler: () => {
            const ids = [...selection.selectedNodes()];
            selection.clear();
            const addedNodes = materialStore.duplicateNodes(ids).map((x) => x!.id);
            selection.setSelectedNodes(addedNodes);
        },
    });

    handler.add({
        key: "c",
        ctrl: true,
        scope: "editor",
        handler: () => {
            workspace.saveNodesInClipboard(
                selection.selectedNodes().map((id) => materialStore.getNodeById(id)!),
            );
        },
    });

    handler.add({
        key: "x",
        ctrl: true,
        scope: "editor",
        handler: () => {
            workspace.saveNodesInClipboard(
                selection.selectedNodes().map((id) => materialStore.getNodeById(id)!),
            );

            selection.selectedNodes().forEach((id) => {
                materialStore.removeNode(id);
            });
        },
    });

    handler.add({
        key: "v",
        ctrl: true,
        scope: "editor",
        handler: () => {
            const clipboardState = workspace.getClipboardState();
            if (clipboardState) {
                const centerPoint = cameraState.getScreenCenterPoint();
                const pasedNodes = materialStore.pasteClipboardState(
                    clipboardState,
                    -centerPoint.x,
                    -centerPoint.y,
                );
                selection.setSelectedNodes(pasedNodes.map((node) => node.id));
            }
        },
    });
}

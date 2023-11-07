import { useShortcutsStore } from "../stores/shortcuts";
import { useWorkspaceStore } from "../stores/workspace";

export default function registerAppShortcuts() {
    const handler = useShortcutsStore()!;
    const workspace = useWorkspaceStore()!;

    handler.add({
        key: "s",
        ctrl: true,
        scope: "app",
        handler: () => {
            workspace.saveActiveMaterial();
        },
    });
}

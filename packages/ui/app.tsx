import { MultiProvider } from "@solid-primitives/context";
import { render } from "solid-js/web";
import { NodeBlueprintsProvider } from "../stores/blueprints.ts";
import { ShortcutsProvider } from "../stores/shortcuts.ts";
import { UserDataStorageProvider } from "../stores/storage.ts";
import { WorkspaceHistoryProvider } from "../stores/workspace-history.tsx";
import { WorkspaceProvider, useWorkspaceStore } from "../stores/workspace.ts";
import { createDefaultMaterial } from "../types/material.ts";
import AppMenuBar from "./app-menu-bar.tsx";
import DialogsOutlet from "./components/dialog/outlet.tsx";
import { DialogsProvider } from "./components/dialog/store.ts";
import SnackbarsOutlet from "./components/snackbar/container.tsx";
import { SnackbarProvider } from "./components/snackbar/context.ts";
import EditorPanel from "./editor/panel.tsx";
import "./scss/_main.scss";
import registerAppShortcuts from "./shortcuts.ts";

function App() {
    return (
        <MultiProvider
            values={[
                SnackbarProvider,
                DialogsProvider,
                NodeBlueprintsProvider,
                UserDataStorageProvider,
                WorkspaceHistoryProvider,
                WorkspaceProvider,
                ShortcutsProvider,
            ]}
        >
            <AppInner />
            <DialogsOutlet />
            <SnackbarsOutlet />

            <div class="w-full h-full flex flex-col overflow-hidden">
                <AppMenuBar />
                <EditorPanel />
            </div>
        </MultiProvider>
    );
}

function AppInner() {
    const workspace = useWorkspaceStore()!;

    registerAppShortcuts();

    workspace.addMaterial(createDefaultMaterial());

    return <></>;
}

render(() => <App />, document.body);

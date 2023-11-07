import { MultiProvider } from "@solid-primitives/context";
import { render } from "solid-js/web";
import { NodeBlueprintsProvider } from "../stores/blueprints.ts";
import { ShortcutsProvider } from "../stores/shortcuts.ts";
import { UserDataStorageProvider } from "../stores/storage.ts";
import { WorkspaceProvider } from "../stores/workspace.ts";
import AppMenuBar from "./app-menu-bar.tsx";
import DialogsOutlet from "./components/dialog/outlet.tsx";
import { DialogsProvider } from "./components/dialog/store.ts";
import EditorPanel from "./editor/panel.tsx";
import "./scss/_main.scss";

function App() {
    return (
        <MultiProvider
            values={[
                DialogsProvider,
                NodeBlueprintsProvider,
                UserDataStorageProvider,
                WorkspaceProvider,
                ShortcutsProvider,
            ]}
        >
            <DialogsOutlet />

            <div class="w-full h-full flex flex-col overflow-hidden">
                <AppMenuBar />
                <EditorPanel />
            </div>
        </MultiProvider>
    );
}

render(() => <App />, document.body);

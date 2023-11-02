/* @refresh reload */
import { render } from "solid-js/web";
import { v4 as uuidv4 } from "uuid";
import { AppContextProvider } from "./app-context.ts";
import AppMenuBar from "./app-menu-bar.tsx";
import DialogsContainer from "./components/dialog/container.tsx";
import { DialogsProvider } from "./components/dialog/context.ts";
import SnackbarsContainer from "./components/snackbar/container.tsx";
import { SnackbarProvider } from "./components/snackbar/context.ts";
import { EDITOR_GRAPH_HEIGHT, EDITOR_GRAPH_WIDTH } from "./editor/constants.ts";
import EditorTabs from "./editor/editor-tabs.tsx";
import "./scss/styles.scss";
import { Material } from "./types/material.ts";
import TextureFilterMethod from "./types/texture-filter.ts";
import { WorkspaceContextProvider } from "./workspace-context";
import { WorkspaceStorageProvider } from "./workspace-storage.ts";
import { WorkspaceHistoryProvider } from "./history-context.tsx";

const DEFAULT_MATERIAL: Material = {
    id: uuidv4(),
    name: "New Material",
    textureWidth: 1024,
    textureHeight: 1024,
    textureFiltering: TextureFilterMethod.Linear,
    nodes: [
        {
            id: 0,
            label: "Solid color",
            parameters: {
                color: [0.5, 1, 0.5],
            },
            path: "@materializer/solid-color",
            x: EDITOR_GRAPH_WIDTH / 2 - 64 - 32,
            y: EDITOR_GRAPH_HEIGHT / 2 - 64,
            zIndex: 0,
        },
        {
            id: 1,
            label: "Output",
            parameters: {},
            path: "@materializer/output",
            x: EDITOR_GRAPH_WIDTH / 2 - 64 + 128 + 32,
            y: EDITOR_GRAPH_HEIGHT / 2 - 64,
            zIndex: 1,
        },
    ],
    connections: [
        {
            from: {
                nodeId: 0,
                socketId: "color",
            },
            to: {
                nodeId: 1,
                socketId: "color",
            },
        },
    ],
};

export default function App() {
    return (
        <SnackbarProvider>
            <DialogsProvider>
                <AppContextProvider>
                    <WorkspaceStorageProvider>
                        <WorkspaceHistoryProvider>
                            <WorkspaceContextProvider initialMaterial={DEFAULT_MATERIAL}>
                                <div class="w-full h-full flex flex-col overflow-hidden">
                                    <SnackbarsContainer />
                                    <DialogsContainer />

                                    <AppMenuBar />
                                    <EditorTabs />
                                </div>
                            </WorkspaceContextProvider>
                        </WorkspaceHistoryProvider>
                    </WorkspaceStorageProvider>
                </AppContextProvider>
            </DialogsProvider>
        </SnackbarProvider>
    );
}

const root = document.getElementById("root");
render(() => <App />, root!);

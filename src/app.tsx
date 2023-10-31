/* @refresh reload */
import "./scss/styles.scss";
import { render } from "solid-js/web";
import { Material } from "./types/material.ts";
import AppMenuBar from "./app-menu-bar.tsx";
import { AppContextProvider } from "./app-context.ts";
import EditorTabs from "./editor/editor-tabs.tsx";
import { WorkspaceContextProvider } from "./workspace-context.ts";
import { WorkspaceStorageProvider } from "./workspace-storage.ts";
import TextureFilterMethod from "./types/texture-filter.ts";

const DEFAULT_MATERIAL: Material = {
    id: "test",
    name: "Default",
    textureWidth: 2048,
    textureHeight: 2048,
    textureFiltering: TextureFilterMethod.Linear,
    nodes: [
        {
            id: 0,
            label: "Solid color",
            parameters: {},
            path: "@materializer/solid-color",
            x: 6900 / 2 + 600,
            y: 6900 / 2 + 250,
            zIndex: 0,
        },
        {
            id: 1,
            label: "Output",
            parameters: {},
            path: "@materializer/output",
            x: 6900 / 2 + 800,
            y: 6900 / 2 + 250,
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
        <AppContextProvider>
            <WorkspaceStorageProvider>
                <WorkspaceContextProvider initialMaterial={DEFAULT_MATERIAL}>
                    <div class="w-full h-full flex flex-col overflow-hidden">
                        <AppMenuBar />
                        <EditorTabs />
                    </div>
                </WorkspaceContextProvider>
            </WorkspaceStorageProvider>
        </AppContextProvider>
    );
}

const root = document.getElementById("root");
render(() => <App />, root!);

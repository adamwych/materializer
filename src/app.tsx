/* @refresh reload */
import "./scss/styles.scss";
import { render } from "solid-js/web";
import { Material } from "./types/material.ts";
import AppMenuBar from "./app-menu-bar.tsx";
import { AppContextProvider } from "./app-context.ts";
import EditorTabs from "./editor/editor-tabs.tsx";
import { WorkspaceContextProvider } from "./workspace-context.ts";

const DEFAULT_MATERIAL: Material = {
    name: "Default",
    textureWidth: 2048,
    textureHeight: 2048,
    nodes: [],
    connections: [],
};

export default function App() {
    return (
        <AppContextProvider>
            <WorkspaceContextProvider initialMaterial={DEFAULT_MATERIAL}>
                <div class="w-full h-full flex flex-col overflow-hidden">
                    <AppMenuBar />
                    <EditorTabs />
                </div>
            </WorkspaceContextProvider>
        </AppContextProvider>
    );
}

const root = document.getElementById("root");
render(() => <App />, root!);

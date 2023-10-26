/* @refresh reload */
import "./scss/styles.scss";
import { render } from "solid-js/web";
import { Material, MaterialNodeOutputTarget } from "./types/material.ts";
import AppMenuBar from "./app-menu-bar.tsx";
import { AppContextProvider } from "./app-context.ts";
import EditorTabs from "./editor/editor-tabs.tsx";
import { WorkspaceContextProvider } from "./workspace-context.ts";

const DEFAULT_MATERIAL: Material = {
    name: "Default",
    textureWidth: 2048,
    textureHeight: 2048,
    nodes: [
        {
            id: 0,
            path: "@materializer/solid-color",
            label: "Solid color",
            x: 110,
            y: 110,
            zIndex: 0,
            parameters: {
                color: [1, 0, 0],
            },
        },
        {
            id: 1,
            path: "@materializer/solid-color",
            label: "Solid color",
            x: 210,
            y: 110,
            zIndex: 0,
            parameters: {
                color: [0, 1, 0],
            },
        },
        {
            id: 2,
            path: "@materializer/blend",
            label: "Blend",
            x: 310,
            y: 110,
            zIndex: 0,
            parameters: {},
        },
        {
            id: 3,
            path: "@materializer/output",
            label: "Output",
            x: 400,
            y: 110,
            zIndex: 1,
            parameters: {
                target: MaterialNodeOutputTarget.Albedo,
            },
        },
        {
            id: 4,
            path: "@materializer/noise",
            label: "Noise",
            x: 610,
            y: 110,
            zIndex: 0,
            parameters: {},
        },
    ],
    connections: [
        {
            from: {
                nodeId: 0,
                socketId: "color",
            },
            to: {
                nodeId: 2,
                socketId: "foreground",
            },
        },
        {
            from: {
                nodeId: 1,
                socketId: "color",
            },
            to: {
                nodeId: 2,
                socketId: "background",
            },
        },
        {
            from: {
                nodeId: 2,
                socketId: "color",
            },
            to: {
                nodeId: 3,
                socketId: "color",
            },
        },
    ],
};

export default function App() {
    return (
        <AppContextProvider initialMaterial={DEFAULT_MATERIAL}>
            <WorkspaceContextProvider initialMaterial={DEFAULT_MATERIAL}>
                <div class="w-full h-full flex flex-col">
                    <AppMenuBar />
                    <EditorTabs />
                </div>
            </WorkspaceContextProvider>
        </AppContextProvider>
    );
}

const root = document.getElementById("root");
render(() => <App />, root!);

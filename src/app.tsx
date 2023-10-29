/* @refresh reload */
import "./scss/styles.scss";
import { render } from "solid-js/web";
import { Material, MaterialNodeOutputTarget } from "./types/material.ts";
import AppMenuBar from "./app-menu-bar.tsx";
import { AppContextProvider } from "./app-context.ts";
import EditorTabs from "./editor/editor-tabs.tsx";
import { WorkspaceContextProvider } from "./workspace-context.ts";
import BlendMode from "./types/blend-mode.ts";

const DEFAULT_MATERIAL: Material = {
    name: "Default",
    textureWidth: 2048,
    textureHeight: 2048,
    nodes: [
        {
            id: 2,
            path: "@materializer/solid-color",
            label: "Solid color",
            x: 410,
            y: 310,
            zIndex: 1,
            parameters: {
                color: [0.5, 0.8, 0],
            },
        },
        {
            id: 0,
            path: "@materializer/scatter",
            label: "Scatter",
            x: 610,
            y: 310,
            zIndex: 0,
            parameters: {
                seed: Math.random(),
                amount: 10,
                size: 0.1,
                spreadX: 1,
                spreadY: 1,
                randomRotation: 0,
                randomScale: 0,
                blendMode: BlendMode.Add,
            },
        },
        {
            id: 1,
            path: "@materializer/output",
            label: "Output",
            x: 810,
            y: 310,
            zIndex: 1,
            parameters: {
                target: MaterialNodeOutputTarget.Albedo,
            },
        },
        {
            id: 3,
            path: "@materializer/scatter",
            label: "Scatter",
            x: 610,
            y: 510,
            zIndex: 0,
            parameters: {
                seed: Math.random(),
                amount: 15,
                size: 0.25,
                spreadX: 1,
                spreadY: 1,
                randomRotation: 0,
                randomScale: 0,
                blendMode: BlendMode.Add,
            },
        },
    ],
    connections: [
        {
            from: {
                nodeId: 2,
                socketId: "color",
            },
            to: {
                nodeId: 0,
                socketId: "shape",
            },
        },
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
        {
            from: {
                nodeId: 0,
                socketId: "color",
            },
            to: {
                nodeId: 3,
                socketId: "shape",
            },
        },
    ],
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

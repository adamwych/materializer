/* @refresh reload */
import "./styles.scss";
import {render} from "solid-js/web";
import {Material, MaterialNodeOutputTarget, MaterialNodeType,} from "./types/material.ts";
import AppMenuBar from "./app-menu-bar.tsx";
import {AppContextProvider} from "./app-context.ts";
import EditorTabs from "./editor-tabs.tsx";

const DEFAULT_MATERIAL: Material = {
    name: "Default",
    textureWidth: 2048,
    textureHeight: 2048,
    nodes: [
        {
            id: 0,
            type: MaterialNodeType.Noise,
            label: "Noise",
            x: 110,
            y: 110,
            zIndex: 0,
            parameters: {},
        },
        {
            id: 1,
            type: MaterialNodeType.Output,
            label: "Output",
            x: 300,
            y: 110,
            zIndex: 1,
            parameters: {
                target: MaterialNodeOutputTarget.Albedo,
            },
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
        <AppContextProvider initialMaterial={DEFAULT_MATERIAL}>
            <div class="w-full h-full flex flex-col">
                <AppMenuBar />
                <EditorTabs />
            </div>
        </AppContextProvider>
    );
}

const root = document.getElementById("root");
render(() => <App />, root!);

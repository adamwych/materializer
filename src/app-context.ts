import { createContextProvider } from "@solid-primitives/context";
import {
    MaterialNodeOutputTarget,
    MaterialNodeSpec,
    MaterialNodesPackage,
} from "./types/material.ts";
import { ReactiveMap } from "@solid-primitives/map";
import solidColorGlsl from "../glsl/solid-color.glsl?raw";
import outputGlsl from "../glsl/output.glsl?raw";
import blendGlsl from "../glsl/blend.glsl?raw";
import noiseGlsl from "../glsl/noise.glsl?raw";

const BUILTIN_NODES_PACKAGE: MaterialNodesPackage = {
    nodes: new Map<string, MaterialNodeSpec>([
        [
            "solid-color",
            {
                name: "Solid color",
                parameters: [
                    {
                        id: "color",
                        label: "Color",
                        default: [1, 0, 0],
                        type: "rgb",
                    },
                ],
                inputSockets: [],
                outputSockets: [
                    {
                        id: "color",
                    },
                ],
                glsl: solidColorGlsl,
            },
        ],
        [
            "noise",
            {
                name: "Noise",
                parameters: [
                    {
                        id: "scale",
                        label: "Scale",
                        default: 64,
                        type: "number",
                        min: 1,
                        max: 256,
                    },
                    {
                        id: "blur",
                        label: "Blur",
                        default: 4,
                        type: "number",
                        min: 1,
                        max: 64,
                    },
                ],
                inputSockets: [],
                outputSockets: [
                    {
                        id: "color",
                    },
                ],
                glsl: noiseGlsl,
            },
        ],
        [
            "blend",
            {
                name: "Blend",
                parameters: [],
                inputSockets: [
                    {
                        id: "foreground",
                    },
                    {
                        id: "background",
                    },
                ],
                outputSockets: [
                    {
                        id: "color",
                    },
                ],
                glsl: blendGlsl,
            },
        ],
        [
            "output",
            {
                name: "Output",
                parameters: [
                    {
                        id: "target",
                        label: "Texture type",
                        default: MaterialNodeOutputTarget.Albedo,
                        type: "select",
                    },
                ],
                inputSockets: [
                    {
                        id: "color",
                    },
                ],
                outputSockets: [
                    {
                        id: "output",
                    },
                ],
                glsl: outputGlsl,
            },
        ],
    ]),
};

export const [AppContextProvider, useAppContext] = createContextProvider(() => {
    const nodesPackages = new ReactiveMap<string, MaterialNodesPackage>();
    nodesPackages.set("@materializer", BUILTIN_NODES_PACKAGE);

    return {
        addNodesPackage(name: string, pkg: MaterialNodesPackage) {
            nodesPackages.set(name, pkg);
        },

        getNodeSpec(path: string) {
            const parts = path.split("/");
            const pkg = nodesPackages.get(parts[0]);
            if (!pkg || !pkg.nodes.has(parts[1])) {
                throw new Error(`Node '${path}' was not found within the registry.`);
            }

            return structuredClone(pkg.nodes.get(parts[1]))!;
        },

        getNodesPackages: () => nodesPackages,
    };
});

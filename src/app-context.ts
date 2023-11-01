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
import shapeGlsl from "../glsl/shape.glsl?raw";
import transformGlsl from "../glsl/transform.glsl?raw";
import invertGlsl from "../glsl/invert.glsl?raw";
import BlendMode from "./types/blend-mode.ts";
import { createSignal } from "solid-js";
import { Point2D } from "./types/point.ts";
import { makeEventListener } from "@solid-primitives/event-listener";

const BUILTIN_NODES_PACKAGE: MaterialNodesPackage = {
    nodes: new Map<string, MaterialNodeSpec>([
        [
            "solid-color",
            {
                name: "Solid color",
                groupName: "Base",
                parameters: [
                    {
                        id: "color",
                        label: "Color",
                        default: [1, 0, 0],
                        type: "rgb",
                        valueType: "vec3",
                    },
                ],
                inputSockets: [],
                outputSockets: [
                    {
                        id: "color",
                    },
                ],
                painter: {
                    type: "glsl",
                    glsl: solidColorGlsl,
                },
            },
        ],
        [
            "noise",
            {
                name: "Noise",
                groupName: "Noises",
                parameters: [
                    {
                        id: "scale",
                        label: "Scale",
                        default: 64,
                        type: "number",
                        valueType: "float",
                        min: 1,
                        max: 256,
                    },
                    {
                        id: "blur",
                        label: "Blur",
                        default: 4,
                        type: "number",
                        valueType: "float",
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
                painter: {
                    type: "glsl",
                    glsl: noiseGlsl,
                },
            },
        ],
        [
            "blend",
            {
                name: "Blend",
                groupName: "Base",
                parameters: [
                    {
                        id: "mode",
                        label: "Mode",
                        default: BlendMode.Add,
                        type: "select",
                        valueType: "int",
                        options: [
                            { label: "Add", value: BlendMode.Add },
                            { label: "Subtract", value: BlendMode.Subtract },
                            { label: "Multiply", value: BlendMode.Multiply },
                            { label: "Divide", value: BlendMode.Divide },
                        ],
                    },
                    {
                        id: "intensity",
                        label: "Intensity",
                        default: 1,
                        type: "number",
                        valueType: "float",
                        min: 0,
                        max: 1,
                    },
                ],
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
                painter: {
                    type: "glsl",
                    glsl: blendGlsl,
                },
            },
        ],
        [
            "output",
            {
                name: "Output",
                groupName: "Base",
                parameters: [
                    {
                        id: "target",
                        label: "Texture type",
                        default: MaterialNodeOutputTarget.Albedo,
                        type: "select",
                        valueType: "int",
                        options: [
                            { label: "Albedo", value: MaterialNodeOutputTarget.Albedo },
                            { label: "Height", value: MaterialNodeOutputTarget.Height },
                        ],
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
                        hidden: true,
                    },
                ],
                painter: {
                    type: "glsl",
                    glsl: outputGlsl,
                },
            },
        ],
        [
            "shape",
            {
                name: "Shape",
                groupName: "Shapes",
                parameters: [
                    {
                        id: "shape",
                        label: "Shape",
                        default: 0,
                        type: "select",
                        valueType: "int",
                        options: [
                            { label: "Rectangle", value: 0 },
                            { label: "Circle", value: 1 },
                            { label: "Triangle", value: 2 },
                        ],
                    },
                    {
                        id: "rectWidth",
                        label: "Width",
                        default: 0.5,
                        type: "number",
                        valueType: "float",
                        min: 0,
                        max: 1,
                        when: "params.shape === 0",
                    },
                    {
                        id: "rectHeight",
                        label: "Height",
                        default: 0.5,
                        type: "number",
                        valueType: "float",
                        min: 0,
                        max: 1,
                        when: "params.shape === 0",
                    },
                    {
                        id: "circleRadius",
                        label: "Radius",
                        default: 0.5,
                        type: "number",
                        valueType: "float",
                        min: 0,
                        max: 1,
                        when: "params.shape === 1",
                    },
                    {
                        id: "triangleSize",
                        label: "Size",
                        default: 0.5,
                        type: "number",
                        valueType: "float",
                        min: 0,
                        max: 1,
                        when: "params.shape === 2",
                    },
                ],
                inputSockets: [],
                outputSockets: [
                    {
                        id: "color",
                    },
                ],
                painter: {
                    type: "glsl",
                    glsl: shapeGlsl,
                },
            },
        ],
        [
            "scatter",
            {
                name: "Scatter",
                groupName: "Layout",
                parameters: [
                    {
                        id: "amount",
                        label: "Amount",
                        default: 10,
                        type: "number",
                        valueType: "int",
                        min: 0,
                        max: 200,
                    },
                    {
                        id: "size",
                        label: "Size",
                        default: 0.25,
                        type: "number",
                        valueType: "float",
                        min: 0,
                        max: 1,
                    },
                    {
                        id: "spreadX",
                        label: "Spread X",
                        default: 1,
                        type: "number",
                        valueType: "float",
                        min: 0,
                        max: 4,
                    },
                    {
                        id: "spreadY",
                        label: "Spread Y",
                        default: 1,
                        type: "number",
                        valueType: "float",
                        min: 0,
                        max: 4,
                    },
                    {
                        id: "randomRotation",
                        label: "Random Rotation",
                        default: 0,
                        type: "number",
                        valueType: "float",
                        min: 0,
                        max: 360,
                    },
                    {
                        id: "randomScale",
                        label: "Random Scale",
                        default: 0,
                        type: "number",
                        valueType: "float",
                        min: 0,
                        max: 512,
                    },
                    {
                        id: "seed",
                        label: "Random Seed",
                        default: 1,
                        type: "number",
                        valueType: "float",
                        min: 0,
                        max: 1,
                    },
                    {
                        id: "blendMode",
                        label: "Blending",
                        default: BlendMode.Add,
                        type: "select",
                        valueType: "int",
                        options: [
                            { label: "Add", value: BlendMode.Add },
                            { label: "Subtract", value: BlendMode.Subtract },
                            { label: "None", value: 255 },
                        ],
                    },
                ],
                inputSockets: [
                    {
                        id: "shape",
                    },
                ],
                outputSockets: [
                    {
                        id: "color",
                    },
                ],
                painter: {
                    type: "scatter",
                },
            },
        ],
        [
            "tile",
            {
                name: "Tile",
                groupName: "Layout",
                parameters: [
                    {
                        id: "amountX",
                        label: "Amount X",
                        default: 1,
                        type: "number",
                        valueType: "int",
                        min: 1,
                        max: 16,
                    },
                    {
                        id: "amountY",
                        label: "Amount Y",
                        default: 1,
                        type: "number",
                        valueType: "int",
                        min: 1,
                        max: 16,
                    },
                    {
                        id: "offsetX",
                        label: "Offset X",
                        default: 0,
                        type: "number",
                        valueType: "float",
                        min: 0,
                        max: 1,
                    },
                    {
                        id: "offsetY",
                        label: "Offset Y",
                        default: 0,
                        type: "number",
                        valueType: "float",
                        min: 0,
                        max: 1,
                    },
                ],
                inputSockets: [
                    {
                        id: "shape",
                    },
                ],
                outputSockets: [
                    {
                        id: "color",
                    },
                ],
                painter: {
                    type: "tile",
                },
            },
        ],
        [
            "transform",
            {
                name: "Transform",
                groupName: "Layout",
                parameters: [
                    {
                        id: "offsetX",
                        label: "Offset X",
                        default: 0.5,
                        type: "number",
                        valueType: "float",
                        min: 0,
                        max: 1,
                    },
                    {
                        id: "offsetY",
                        label: "Offset Y",
                        default: 0.5,
                        type: "number",
                        valueType: "float",
                        min: 0,
                        max: 1,
                    },
                ],
                inputSockets: [
                    {
                        id: "in",
                    },
                ],
                outputSockets: [
                    {
                        id: "color",
                    },
                ],
                painter: {
                    type: "glsl",
                    glsl: transformGlsl,
                },
            },
        ],
        [
            "invert",
            {
                name: "Invert",
                groupName: "Utilities",
                parameters: [],
                inputSockets: [
                    {
                        id: "in",
                    },
                ],
                outputSockets: [
                    {
                        id: "out",
                    },
                ],
                painter: {
                    type: "glsl",
                    glsl: invertGlsl,
                },
            },
        ],
    ]),
};

export const [AppContextProvider, useAppContext] = createContextProvider(() => {
    const [mousePosition, setMousePosition] = createSignal<Point2D>({ x: 0, y: 0 });
    const nodesPackages = new ReactiveMap<string, MaterialNodesPackage>();
    nodesPackages.set("@materializer", BUILTIN_NODES_PACKAGE);

    makeEventListener(window, "mousemove", (ev) => {
        setMousePosition({ x: ev.pageX, y: ev.pageY });
    });

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

        nodesPackages,
        mousePosition,
    };
});

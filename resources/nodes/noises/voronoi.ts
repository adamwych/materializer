import { MaterialNodeBlueprint } from "../../../packages/material/node";
import glsl from "./voronoi.fs?raw";

export default {
    id: "voronoi",
    name: "Voronoi",
    groupName: "Noises",
    parameters: {
        offsetX: {
            id: "offsetX",
            name: "Offset X",
            inputType: "number",
            inputProps: { min: 0, max: 1 },
            valueType: "float",
            default: 0,
        },
        offsetY: {
            id: "offsetY",
            name: "Offset Y",
            inputType: "number",
            inputProps: { min: 0, max: 1 },
            valueType: "float",
            default: 0,
        },
        scale: {
            id: "scale",
            name: "Scale",
            inputType: "number",
            inputProps: { min: 0, max: 32 },
            valueType: "float",
            default: 12,
        },
        limit: {
            id: "limit",
            name: "Limit",
            inputType: "number",
            inputProps: { min: 0.01, max: 0.1, step: 0.001 },
            valueType: "float",
            default: 0.05,
        },
    },
    inputs: {},
    outputs: {
        color: {
            id: "color",
            textureType: "rgb",
            hidden: false,
        },
    },
    painter: {
        type: "glsl",
        fragmentShader: glsl,
    },
} satisfies MaterialNodeBlueprint;

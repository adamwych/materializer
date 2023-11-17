import { MaterialNodeBlueprint } from "../../../packages/material/node";
import glsl from "./perlin.fs?raw";

export default {
    id: "perlin-noise",
    name: "Perlin Noise",
    groupName: "Noises",
    parameters: {
        offset: {
            id: "offset",
            name: "Offset X/Y",
            inputType: "number",
            inputProps: { min: 0, max: 1 },
            valueType: "vec2",
            default: [0, 0],
        },
        scale: {
            id: "scale",
            name: "Scale",
            inputType: "number",
            inputProps: { min: 0, max: 128 },
            valueType: "float",
            default: 16,
        },
        sharpness: {
            id: "sharpness",
            name: "Sharpness",
            inputType: "number",
            inputProps: { min: 0, max: 16 },
            valueType: "float",
            default: 2.3,
        },
        levels: {
            id: "levels",
            name: "Levels",
            inputType: "number",
            inputProps: { min: 0, max: 8, step: 1 },
            valueType: "int",
            default: 1,
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

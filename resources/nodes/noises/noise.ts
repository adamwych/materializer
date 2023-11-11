import { MaterialNodeBlueprint } from "../../../packages/material/node";
import glsl from "./noise.glsl?raw";

export default {
    id: "noise",
    name: "Noise",
    groupName: "Noises",
    parameters: {
        scale: {
            id: "scale",
            name: "Scale",
            inputType: "number",
            inputProps: { min: 0, max: 128 },
            valueType: "float",
            default: 64,
        },
        blur: {
            id: "blur",
            name: "Blur",
            inputType: "number",
            inputProps: { min: 0, max: 128 },
            valueType: "float",
            default: 4,
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
    preferredTextureSize: 1024,
} satisfies MaterialNodeBlueprint;

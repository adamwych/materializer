import { MaterialNodeBlueprint } from "../../../packages/material/node";
import glsl from "./anisotropic.glsl?raw";

export default {
    id: "anisotropic-noise",
    name: "Anisotropic Noise",
    groupName: "Noises",
    parameters: {
        direction: {
            id: "direction",
            name: "Direction",
            default: 0,
            inputType: "select",
            inputProps: {
                options: [
                    { label: "Vertical", value: 0 },
                    { label: "Horizontal", value: 1 },
                ],
            },
            valueType: "int",
        },
        stripes: {
            id: "stripes",
            name: "Stripes",
            default: 162,
            inputType: "number",
            inputProps: { min: 0, max: 324 },
            valueType: "int",
        },
        seed: {
            id: "seed",
            name: "Seed",
            default: 0,
            inputType: "number",
            inputProps: { min: 0, max: 1 },
            valueType: "float",
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

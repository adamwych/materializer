import { MaterialNodeBlueprint } from "../../../packages/material/node";
import glsl from "./gaussian.glsl?raw";

export default {
    id: "gaussian-blur",
    name: "Gaussian Blur",
    groupName: "Blurs",
    parameters: {
        intensity: {
            id: "intensity",
            name: "Intensity",
            default: 0.5,
            inputType: "number",
            inputProps: {
                min: 0,
                max: 1,
            },
            valueType: "float",
        },
    },
    inputs: {
        in: {
            id: "in",
            textureType: "rgb",
            hidden: false,
        },
    },
    outputs: {
        color: {
            id: "color",
            textureType: "rgb",
            hidden: false,
        },
    },
    painter: {
        type: "glsl-two-pass",
        fragmentShader: glsl,
    },
} satisfies MaterialNodeBlueprint;

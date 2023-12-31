import { MaterialNodeBlueprint } from "../../../packages/material/node";
import glsl from "./invert.fs?raw";

export default {
    id: "invert",
    name: "Invert",
    groupName: "Utilities",
    parameters: {},
    inputs: {
        colorIn: {
            id: "colorIn",
            textureType: "rgb",
            hidden: false,
        },
    },
    outputs: {
        colorOut: {
            id: "colorOut",
            textureType: "rgb",
            hidden: false,
        },
    },
    painter: {
        type: "glsl",
        fragmentShader: glsl,
    },
} satisfies MaterialNodeBlueprint;

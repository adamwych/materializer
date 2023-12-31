import { MaterialNodeBlueprint } from "../../../packages/material/node";
import glsl from "./pass-through.fs?raw";

export default {
    id: "passthrough",
    name: "Pass-through",
    groupName: "Utilities",
    parameters: {},
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
        type: "glsl",
        fragmentShader: glsl,
    },
} satisfies MaterialNodeBlueprint;

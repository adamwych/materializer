import { MaterialNodeBlueprint } from "../../../packages/material/node";
import glsl from "./normal.fs?raw";

export default {
    id: "normal",
    name: "Normal",
    groupName: "Base",
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
    preferredTextureSize: 1024,
} satisfies MaterialNodeBlueprint;

import { MaterialNodeBlueprint } from "../../../packages/material/node";
import glsl from "./output.glsl?raw";

export default {
    id: "output",
    name: "Output",
    groupName: "Base",
    parameters: {},
    inputs: {
        color: {
            id: "color",
            textureType: "rgb",
            hidden: false,
        },
    },
    outputs: {
        colorOut: {
            id: "colorOut",
            textureType: "rgb",
            hidden: true,
        },
    },
    painter: {
        type: "glsl",
        fragmentShader: glsl,
    },
    preferredTextureSize: 1024,
} satisfies MaterialNodeBlueprint;

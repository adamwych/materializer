import { MaterialNodeBlueprint } from "../../../packages/material/node";
import glsl from "./solid-color.glsl?raw";

export default {
    id: "solid-color",
    name: "Solid color",
    groupName: "Generate",
    parameters: {
        color: {
            id: "color",
            name: "Color",
            inputType: "rgb",
            inputProps: {},
            valueType: "vec3",
            default: [1, 1, 1],
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
    preferredTextureSize: 1,
} satisfies MaterialNodeBlueprint;

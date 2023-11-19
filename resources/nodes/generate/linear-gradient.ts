import { MaterialNodeBlueprint } from "../../../packages/material/node";
import glsl from "./linear-gradient.fs?raw";

export default {
    id: "gradient",
    name: "Linear Gradient",
    groupName: "Generate",
    parameters: {
        direction: {
            id: "direction",
            name: "Direction",
            default: 0,
            inputType: "select",
            inputProps: {
                options: [
                    { label: "Top to bottom", value: 0 },
                    { label: "Bottom to top", value: 1 },
                    { label: "Left to right", value: 2 },
                    { label: "Right to left", value: 3 },
                ],
            },
            valueType: "int",
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

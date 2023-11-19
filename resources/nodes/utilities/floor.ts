import { MaterialNodeBlueprint } from "../../../packages/material/node";
import glsl from "./floor.fs?raw";

export default {
    id: "floor",
    name: "Floor",
    groupName: "Utilities",
    parameters: {
        steps: {
            id: "steps",
            name: "Steps",
            default: 0,
            inputType: "number",
            inputProps: { min: 0, max: 64, step: 1 },
            valueType: "int",
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
        type: "glsl",
        fragmentShader: glsl,
    },
} satisfies MaterialNodeBlueprint;

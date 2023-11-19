import { MaterialNodeBlueprint } from "../../../packages/material/node";
import glsl from "./transform.fs?raw";

export default {
    id: "transform",
    name: "Transform",
    groupName: "Layout",
    parameters: {
        offset: {
            id: "offset",
            name: "Offset X/Y",
            default: [0, 0],
            inputType: "number",
            inputProps: {
                min: -1,
                max: 1,
            },
            valueType: "vec2",
        },
        rotation: {
            id: "rotation",
            name: "Rotation",
            default: 0,
            inputType: "number",
            inputProps: {
                min: 0,
                max: 360,
            },
            valueType: "float",
        },
        scale: {
            id: "scale",
            name: "Scale X/Y",
            default: [1, 1],
            inputType: "number",
            inputProps: {
                min: 0,
                max: 2,
            },
            valueType: "vec2",
        },
        wrapMode: {
            id: "wrapMode",
            name: "Wrap Mode",
            default: 0,
            inputType: "select",
            inputProps: {
                options: [
                    { label: "Clamp to edge", value: 0 },
                    { label: "Repeat", value: 1 },
                    { label: "Cut out", value: 2 },
                ],
            },
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

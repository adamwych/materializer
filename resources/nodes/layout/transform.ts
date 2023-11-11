import { MaterialNodeBlueprint } from "../../../packages/material/node";
import glsl from "./transform.glsl?raw";

export default {
    id: "transform",
    name: "Transform",
    groupName: "Layout",
    parameters: {
        offsetX: {
            id: "offsetX",
            name: "Offset X",
            default: 0,
            inputType: "number",
            inputProps: {
                min: -1,
                max: 1,
            },
            valueType: "float",
        },
        offsetY: {
            id: "offsetY",
            name: "Offset Y",
            default: 0,
            inputType: "number",
            inputProps: {
                min: -1,
                max: 1,
            },
            valueType: "float",
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
        scaleX: {
            id: "scaleX",
            name: "Scale X",
            default: 1,
            inputType: "number",
            inputProps: {
                min: 0,
                max: 2,
            },
            valueType: "float",
        },
        scaleY: {
            id: "scaleY",
            name: "Scale Y",
            default: 1,
            inputType: "number",
            inputProps: {
                min: 0,
                max: 2,
            },
            valueType: "float",
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
    preferredTextureSize: 1024,
} satisfies MaterialNodeBlueprint;

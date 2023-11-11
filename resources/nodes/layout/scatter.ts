import { MaterialNodeBlueprint } from "../../../packages/material/node";
import BlendMode from "../../../packages/types/blend-mode";

export default {
    id: "scatter",
    name: "Scatter",
    groupName: "Layout",
    parameters: {
        amount: {
            id: "amount",
            name: "Amount",
            default: 10,
            inputType: "number",
            valueType: "int",
            inputProps: {
                min: 0,
                max: 200,
            },
        },
        size: {
            id: "size",
            name: "Size",
            default: 0.25,
            inputType: "number",
            valueType: "float",
            inputProps: {
                min: 0,
                max: 1,
            },
        },
        spreadX: {
            id: "spreadX",
            name: "Spread X",
            default: 1,
            inputType: "number",
            valueType: "float",
            inputProps: {
                min: 0,
                max: 4,
            },
        },
        spreadY: {
            id: "spreadY",
            name: "Spread Y",
            default: 1,
            inputType: "number",
            valueType: "float",
            inputProps: {
                min: 0,
                max: 4,
            },
        },
        randomRotation: {
            id: "randomRotation",
            name: "Random Rotation",
            default: 0,
            inputType: "number",
            valueType: "float",
            inputProps: {
                min: 0,
                max: 360,
            },
        },
        randomScale: {
            id: "randomScale",
            name: "Random Scale",
            default: 0,
            inputType: "number",
            valueType: "float",
            inputProps: {
                min: 0,
                max: 512,
            },
        },
        seed: {
            id: "seed",
            name: "Random Seed",
            default: 1,
            inputType: "number",
            valueType: "float",
            inputProps: {
                min: 0,
                max: 1,
            },
        },
        blendMode: {
            id: "blendMode",
            name: "Blending",
            default: BlendMode.Add,
            inputType: "select",
            valueType: "int",
            inputProps: {
                options: [
                    { label: "Add", value: BlendMode.Add },
                    { label: "Subtract", value: BlendMode.Subtract },
                    { label: "None", value: 255 },
                ],
            },
        },
    },
    inputs: {
        shape: {
            id: "shape",
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
        type: "scatter",
    },
    preferredTextureSize: 1024,
} satisfies MaterialNodeBlueprint;

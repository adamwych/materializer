import { MaterialNodeBlueprint } from "../../../packages/types/node";

export default {
    id: "tile",
    name: "Tile",
    groupName: "Layout",
    parameters: {
        amountX: {
            id: "amountX",
            name: "Amount X",
            default: 1,
            inputType: "number",
            valueType: "int",
            inputProps: {
                min: 1,
                max: 16,
            },
        },
        amountY: {
            id: "amountY",
            name: "Amount Y",
            default: 1,
            inputType: "number",
            valueType: "int",
            inputProps: {
                min: 1,
                max: 16,
            },
        },
        offsetX: {
            id: "offsetX",
            name: "Offset X",
            default: 0,
            inputType: "number",
            valueType: "float",
            inputProps: {
                min: 0,
                max: 1,
            },
        },
        offsetY: {
            id: "offsetY",
            name: "Offset Y",
            default: 0,
            inputType: "number",
            valueType: "float",
            inputProps: {
                min: 0,
                max: 1,
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
        type: "tile",
    },
    preferredTextureSize: 1024,
} satisfies MaterialNodeBlueprint;

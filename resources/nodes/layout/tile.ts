import { MaterialNodeBlueprint } from "../../../packages/material/node";

export default {
    id: "tile",
    name: "Tile",
    groupName: "Layout",
    parameters: {
        amount: {
            id: "amount",
            name: "Amount X/Y",
            default: [1, 1],
            inputType: "number",
            valueType: "ivec2",
            inputProps: {
                min: 1,
                max: 16,
            },
        },
        offset: {
            id: "offset",
            name: "Offset X/Y",
            default: [0, 0],
            inputType: "number",
            valueType: "vec2",
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
} satisfies MaterialNodeBlueprint;

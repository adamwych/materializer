import BlendMode from "../../../packages/types/blend-mode";
import { MaterialNodeBlueprint } from "../../../packages/material/node";
import glsl from "./blend.glsl?raw";

export default {
    id: "blend",
    name: "Blend",
    groupName: "Base",
    parameters: {
        mode: {
            id: "mode",
            name: "Mode",
            default: BlendMode.Add,
            inputType: "select",
            inputProps: {
                options: [
                    { label: "Add", value: BlendMode.Add },
                    { label: "Subtract", value: BlendMode.Subtract },
                    { label: "Multiply", value: BlendMode.Multiply },
                    { label: "Divide", value: BlendMode.Divide },
                ],
            },
            valueType: "int",
        },
        intensity: {
            id: "intensity",
            name: "Intensity",
            inputType: "number",
            inputProps: {
                min: 0,
                max: 1,
            },
            valueType: "float",
            default: 1,
        },
    },
    inputs: {
        foreground: {
            id: "foreground",
            textureType: "rgb",
            hidden: false,
        },
        background: {
            id: "background",
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

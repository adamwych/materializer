import { MaterialNodeBlueprint } from "../../../packages/material/node";
import { PbrTargetTextureType } from "../../../packages/types/pbr";
import glsl from "./output.fs?raw";

export default {
    id: "output",
    name: "Output",
    groupName: "Base",
    parameters: {
        targetTexture: {
            id: "targetTexture",
            name: "Target texture",
            default: PbrTargetTextureType.BaseColor,
            inputType: "select",
            inputProps: {
                options: [
                    {
                        label: "Base Color",
                        value: PbrTargetTextureType.BaseColor,
                    },
                    {
                        label: "Normal",
                        value: PbrTargetTextureType.Normal,
                    },
                    {
                        label: "Height",
                        value: PbrTargetTextureType.Height,
                    },
                    {
                        label: "Metallic",
                        value: PbrTargetTextureType.Metallic,
                    },
                    {
                        label: "Roughness",
                        value: PbrTargetTextureType.Roughness,
                    },
                    {
                        label: "Ambient Occlusion",
                        value: PbrTargetTextureType.AmbientOcclusion,
                    },
                ],
            },
            valueType: "int",
        },
    },
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
} satisfies MaterialNodeBlueprint;

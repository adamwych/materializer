import { MaterialNodeBlueprint } from "../../../packages/material/node";
import glsl from "./shape.fs?raw";

export default {
    id: "shape",
    name: "Shape",
    groupName: "Generate",
    parameters: {
        shape: {
            id: "shape",
            name: "Shape",
            default: 0,
            inputType: "select",
            valueType: "int",
            inputProps: {
                options: [
                    { label: "Rectangle", value: 0 },
                    { label: "Circle", value: 1 },
                    { label: "Triangle", value: 2 },
                ],
            },
        },
        rectWidth: {
            id: "rectWidth",
            name: "Width",
            default: 0.5,
            inputType: "number",
            valueType: "float",
            inputProps: {
                min: 0,
                max: 1,
            },
            when: "params.shape === 0",
        },
        rectHeight: {
            id: "rectHeight",
            name: "Height",
            default: 0.5,
            inputType: "number",
            valueType: "float",
            inputProps: {
                min: 0,
                max: 1,
            },
            when: "params.shape === 0",
        },
        rectRoundness: {
            id: "rectRoundness",
            name: "Roundness",
            default: 0,
            inputType: "number",
            valueType: "float",
            inputProps: {
                min: 0,
                max: 1,
            },
            when: "params.shape === 0",
        },
        circleRadius: {
            id: "circleRadius",
            name: "Radius",
            default: 0.5,
            inputType: "number",
            valueType: "float",
            inputProps: {
                min: 0,
                max: 1,
            },
            when: "params.shape === 1",
        },
        triangleSize: {
            id: "triangleSize",
            name: "Size",
            default: 0.5,
            inputType: "number",
            valueType: "float",
            inputProps: {
                min: 0,
                max: 1,
            },
            when: "params.shape === 2",
        },
        cutoff: {
            id: "cutoff",
            name: "Cutoff",
            default: 0,
            inputType: "number",
            valueType: "float",
            inputProps: {
                min: 0,
                max: 1,
            },
        },
        outline: {
            id: "outline",
            name: "Outline Thickness",
            default: 0,
            inputType: "number",
            valueType: "float",
            inputProps: {
                min: 0,
                max: 1,
            },
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

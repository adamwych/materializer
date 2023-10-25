import {
    MaterialNodeParameterInfo,
    MaterialNodeSocketInfo,
    MaterialNodeType,
} from "../types/material.ts";
import solidColorGlsl from "./solid-color.glsl?raw";
import solidColorInfo from "./solid-color.json";
import blendGlsl from "./blend.glsl?raw";
import blendInfo from "./blend.json";
import noiseGlsl from "./noise.glsl?raw";
import noiseInfo from "./noise.json";
import outputGlsl from "./output.glsl?raw";
import outputInfo from "./output.json";

export type BuiltinNodeSpec = {
    name: string;
    type: MaterialNodeType;
    parameters: Array<MaterialNodeParameterInfo>;
    inputSockets: Array<MaterialNodeSocketInfo>;
    outputSockets: Array<MaterialNodeSocketInfo>;
};

export function getBuiltinNodeFragmentShader(type: MaterialNodeType): string {
    switch (type) {
        case MaterialNodeType.SolidColor:
            return solidColorGlsl;
        case MaterialNodeType.Blend:
            return blendGlsl;
        case MaterialNodeType.Noise:
            return noiseGlsl;
        case MaterialNodeType.Output:
            return outputGlsl;
    }
}

export function getBuiltinNodeSpec(type: MaterialNodeType): BuiltinNodeSpec {
    switch (type) {
        case MaterialNodeType.SolidColor:
            return solidColorInfo;
        case MaterialNodeType.Blend:
            return blendInfo;
        case MaterialNodeType.Noise:
            return noiseInfo;
        case MaterialNodeType.Output:
            return outputInfo;
    }
}

export function getBuiltinNodes(): Array<BuiltinNodeSpec> {
    return Object.values(MaterialNodeType)
        .filter((x) => typeof x !== "string")
        .map((x) => getBuiltinNodeSpec(x as MaterialNodeType));
}

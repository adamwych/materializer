import { MaterialNodeBlueprint } from "../../../packages/material/node";

export default {
    id: "anisotropic-noise",
    name: "Anisotropic Noise",
    groupName: "Noises",
    parameters: {
        direction: {
            id: "direction",
            name: "Direction",
            default: 0,
            inputType: "select",
            inputProps: {
                options: [
                    { label: "Vertical", value: 0 },
                    { label: "Horizontal", value: 1 },
                ],
            },
            valueType: "int",
        },
        stripes: {
            id: "stripes",
            name: "Stripes",
            default: 162,
            inputType: "number",
            inputProps: { min: 0, max: 324 },
            valueType: "int",
        },
        seed: {
            id: "seed",
            name: "Seed",
            default: 0,
            inputType: "number",
            inputProps: { min: 0, max: 1 },
            valueType: "float",
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
        fragmentShader: `
        #version 300 es
        precision highp float;
        precision highp int;

        in vec2 a_texCoord;

        uniform int p_direction;
        uniform int p_stripes;
        uniform float p_seed;

        out vec4 out_color;

        float randd(vec2 co){
            return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
        }

        void main(void) {
            float stripes = float(p_stripes);
            float value = 0.0;

            if (p_direction == 0) {
                float x = (floor(a_texCoord.x * stripes) / stripes) + 1.0;
                float d = x * stripes * (1.0 - p_seed);
                float offset = randd(vec2(d, d));
                value = abs(a_texCoord.y - offset) * 1.5;
            } else {
                float y = (floor(a_texCoord.y * stripes) / stripes) + 1.0;
                float d = y * stripes * (1.0 - p_seed);
                float offset = randd(vec2(d, d));
                value = abs(a_texCoord.x - offset) * 1.5;
            }

            out_color = vec4(value, value, value, 1);
        }`.trim(),
    },
    preferredTextureSize: 1024,
} satisfies MaterialNodeBlueprint;

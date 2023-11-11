import { MaterialNodeBlueprint } from "../../../packages/material/node";

export default {
    id: "floor",
    name: "Floor",
    groupName: "Utilities",
    parameters: {
        steps: {
            id: "steps",
            name: "Steps",
            default: 0,
            inputType: "number",
            inputProps: { min: 0, max: 64, step: 1 },
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
        fragmentShader: `
        #version 300 es
        precision highp float;
        
        in vec2 a_texCoord;

        uniform int p_steps;
        uniform sampler2D i_in;
        
        out vec4 out_color;
        
        void main(void) {
            out_color = texture(i_in, a_texCoord);

            if (p_steps > 0) {
                float steps = float(p_steps);
                out_color.r = floor(out_color.r * steps) / steps;
                out_color.g = floor(out_color.g * steps) / steps;
                out_color.b = floor(out_color.b * steps) / steps;
            }
        }`.trim(),
    },
    preferredTextureSize: 1024,
} satisfies MaterialNodeBlueprint;

import { MaterialNodeBlueprint } from "../../../packages/material/node";

export default {
    id: "gradient",
    name: "Linear Gradient",
    groupName: "Generate",
    parameters: {
        direction: {
            id: "direction",
            name: "Direction",
            default: 0,
            inputType: "select",
            inputProps: {
                options: [
                    { label: "Top to bottom", value: 0 },
                    { label: "Bottom to top", value: 1 },
                    { label: "Left to right", value: 2 },
                    { label: "Right to left", value: 3 },
                ],
            },
            valueType: "int",
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
        
        in vec2 a_texCoord;

        uniform int p_direction;
        uniform vec3 p_color;
        
        out vec4 out_color;
        
        void main(void) {
            float value = 0.0;

            switch (p_direction) {
                case 0:
                    value = 1.0 - a_texCoord.y;
                    break;
                case 1:
                    value = a_texCoord.y;
                    break;
                case 2:
                    value = 1.0 - a_texCoord.x;
                    break;
                case 3:
                    value = a_texCoord.x;
                    break;
            }

            out_color = vec4(value, value, value, 1);
        }`.trim(),
    },
    preferredTextureSize: 1024,
} satisfies MaterialNodeBlueprint;

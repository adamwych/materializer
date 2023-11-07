import { MaterialNodeBlueprint } from "../../../packages/types/node";

export default {
    id: "solid-color",
    name: "Solid color",
    groupName: "Base",
    parameters: {
        color: {
            id: "color",
            name: "Color",
            inputType: "rgb",
            inputProps: {},
            valueType: "vec3",
            default: [1, 0, 0],
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
        
        uniform vec3 p_color;
        
        out vec4 out_color;
        
        void main(void) {
            out_color = vec4(p_color.r, p_color.g, p_color.b, 1);
        }`.trim(),
    },
    preferredTextureSize: 1,
} satisfies MaterialNodeBlueprint;

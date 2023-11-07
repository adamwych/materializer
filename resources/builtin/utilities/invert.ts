import { MaterialNodeBlueprint } from "../../../packages/types/node";

export default {
    id: "invert",
    name: "Invert",
    groupName: "Utilities",
    parameters: {},
    inputs: {
        colorIn: {
            id: "colorIn",
            textureType: "rgb",
            hidden: false,
        },
    },
    outputs: {
        colorOut: {
            id: "colorOut",
            textureType: "rgb",
            hidden: false,
        },
    },
    painter: {
        type: "glsl",
        fragmentShader: `#version 300 es
        precision highp float;
        
        in vec2 a_texCoord;
        
        uniform sampler2D i_colorIn;
        
        out vec4 out_color;
        
        void main(void) {
            out_color = 1.0 - texture(i_colorIn, a_texCoord);
        }`.trim(),
    },
    preferredTextureSize: 512,
} satisfies MaterialNodeBlueprint;

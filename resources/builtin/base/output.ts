import { MaterialNodeBlueprint } from "../../../packages/types/node";

export default {
    id: "output",
    name: "Output",
    groupName: "Base",
    parameters: {},
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
        fragmentShader: `#version 300 es
        precision highp float;
        
        in vec2 a_texCoord;
        
        uniform sampler2D i_color;
        
        out vec4 out_color;
        
        void main(void) {
            out_color = texture(i_color, a_texCoord);
        }`.trim(),
    },
    preferredTextureSize: 512,
} satisfies MaterialNodeBlueprint;

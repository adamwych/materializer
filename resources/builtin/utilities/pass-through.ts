import { MaterialNodeBlueprint } from "../../../packages/material/node";

export default {
    id: "passthrough",
    name: "Pass-through",
    groupName: "Utilities",
    parameters: {},
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

        uniform sampler2D i_in;
        
        out vec4 out_color;
        
        void main(void) {
            out_color = texture(i_in, a_texCoord);
        }`.trim(),
    },
    preferredTextureSize: 1024,
} satisfies MaterialNodeBlueprint;

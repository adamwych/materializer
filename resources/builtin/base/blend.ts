import BlendMode from "../../../packages/types/blend-mode";
import { MaterialNodeBlueprint } from "../../../packages/types/node";

export default {
    id: "blend",
    name: "Blend",
    groupName: "Base",
    parameters: {
        mode: {
            id: "mode",
            name: "Mode",
            default: BlendMode.Add,
            inputType: "select",
            inputProps: {
                options: [
                    { label: "Add", value: BlendMode.Add },
                    { label: "Subtract", value: BlendMode.Subtract },
                    { label: "Multiply", value: BlendMode.Multiply },
                    { label: "Divide", value: BlendMode.Divide },
                ],
            },
            valueType: "int",
        },
        intensity: {
            id: "intensity",
            name: "Intensity",
            inputType: "number",
            inputProps: {
                min: 0,
                max: 1,
            },
            valueType: "float",
            default: 1,
        },
    },
    inputs: {
        foreground: {
            id: "foreground",
            textureType: "rgb",
            hidden: false,
        },
        background: {
            id: "background",
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
        
        uniform int p_mode;
        uniform float p_intensity;
        uniform sampler2D i_foreground;
        uniform sampler2D i_background;
        
        out vec4 out_color;
        
        void main(void) {    
            out_color = texture(i_background, a_texCoord);
            
            if (p_mode == 0) {
                out_color += texture(i_foreground, a_texCoord) * p_intensity;
            } else if (p_mode == 1) {
                out_color -= texture(i_foreground, a_texCoord) * p_intensity;
            } else if (p_mode == 2) {
                out_color *= texture(i_foreground, a_texCoord) * p_intensity;
            } else if (p_mode == 3) {
                out_color /= texture(i_foreground, a_texCoord) * p_intensity;
            }
            
            out_color.a = 1.0;
        }`.trim(),
    },
    preferredTextureSize: 512,
} satisfies MaterialNodeBlueprint;

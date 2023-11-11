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

    if(p_mode == 0) {
        out_color += texture(i_foreground, a_texCoord) * p_intensity;
    } else if(p_mode == 1) {
        out_color -= texture(i_foreground, a_texCoord) * p_intensity;
    } else if(p_mode == 2) {
        out_color *= texture(i_foreground, a_texCoord) * p_intensity;
    } else if(p_mode == 3) {
        out_color /= texture(i_foreground, a_texCoord) * p_intensity;
    }

    out_color.a = 1.f;
}
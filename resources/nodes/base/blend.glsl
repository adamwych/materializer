#version 300 es
precision highp float;

in vec2 a_texCoord;

uniform int p_mode;
uniform float p_intensity;
uniform sampler2D i_foreground;
uniform sampler2D i_background;

out vec4 out_color;

void main(void) {
    vec3 color = texture(i_background, a_texCoord).rgb;

    if(p_mode == 0) {
        color += texture(i_foreground, a_texCoord).rgb * p_intensity;
    } else if(p_mode == 1) {
        color -= texture(i_foreground, a_texCoord).rgb * p_intensity;
    } else if(p_mode == 2) {
        color *= texture(i_foreground, a_texCoord).rgb * p_intensity;
    } else if(p_mode == 3) {
        color /= texture(i_foreground, a_texCoord).rgb * p_intensity;
    }

    out_color = vec4(color, 1);
}
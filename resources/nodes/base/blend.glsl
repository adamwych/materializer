#version 300 es
precision highp float;

in vec2 a_texCoord;

uniform int p_mode;
uniform float p_intensity;
uniform sampler2D i_foreground;
uniform sampler2D i_background;

out vec4 out_color;

#define BLEND_MODE_ADD 0
#define BLEND_MODE_SUBTRACT 1
#define BLEND_MODE_MULTIPLY 2
#define BLEND_MODE_DIVIDE 3

void main(void) {
    vec3 backgroundColor = texture(i_background, a_texCoord).rgb;
    vec3 foregroundColor = texture(i_foreground, a_texCoord).rgb * p_intensity;

    if(p_mode == BLEND_MODE_ADD) {
        backgroundColor += foregroundColor;
    } else if(p_mode == BLEND_MODE_SUBTRACT) {
        backgroundColor -= foregroundColor;
    } else if(p_mode == BLEND_MODE_MULTIPLY) {
        backgroundColor *= foregroundColor;
    } else if(p_mode == BLEND_MODE_DIVIDE) {
        // Clamp all values to prevent division by zero.
        foregroundColor.r = clamp(foregroundColor.r, 1.0f / 255.0f, 1.0f);
        foregroundColor.g = clamp(foregroundColor.g, 1.0f / 255.0f, 1.0f);
        foregroundColor.b = clamp(foregroundColor.b, 1.0f / 255.0f, 1.0f);
        backgroundColor /= foregroundColor;
    }

    out_color = vec4(backgroundColor, 1);
}
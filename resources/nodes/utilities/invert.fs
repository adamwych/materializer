#version 300 es
precision highp float;

in vec2 a_texCoord;

uniform sampler2D i_colorIn;

out vec4 out_color;

void main(void) {
    out_color = 1.0f - texture(i_colorIn, a_texCoord);
}
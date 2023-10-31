#version 300 es
precision highp float;

in vec2 a_texCoord;

uniform float p_offsetX;
uniform float p_offsetY;
uniform sampler2D i_in;

out vec4 out_color;

void main(void) {
    out_color = texture(i_in, a_texCoord + vec2(p_offsetX, p_offsetY));
}
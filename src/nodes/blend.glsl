#version 300 es
precision highp float;

in vec2 a_texCoord;

uniform sampler2D i_foreground;
uniform sampler2D i_background;

out vec4 out_color;

void main(void) {
    out_color = texture(i_foreground, a_texCoord) + texture(i_background, a_texCoord);
}
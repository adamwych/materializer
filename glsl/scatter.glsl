#version 300 es
precision highp float;

in vec2 v_texCoord;

uniform sampler2D i_shape;

out vec4 out_color;

void main(void) {
    out_color = texture(i_shape, v_texCoord);
}
#version 300 es
precision highp float;

in vec2 v_texCoord;

uniform sampler2D i_albedo;

out vec4 out_color;

void main(void) {
    out_color = texture(i_albedo, v_texCoord);
}
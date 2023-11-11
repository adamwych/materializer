#version 300 es
precision highp float;

uniform vec3 p_color;

out vec4 out_color;

void main(void) {
    out_color = vec4(p_color.r, p_color.g, p_color.b, 1);
}
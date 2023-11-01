#version 300 es
precision highp float;

in vec2 v_texCoord;
flat in int v_instanceId;

uniform sampler2D i_shape;
uniform int x_instancesCount;

out vec4 out_color;

void main(void) {
    out_color = texture(i_shape, v_texCoord);
    out_color.a = 1.0;
}
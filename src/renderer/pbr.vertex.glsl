#version 300 es
precision highp float;

in vec3 a_position;
in vec2 a_texCoord;

out vec2 v_texCoord;
uniform mat4 u_viewProjection;

void main(void) {
    v_texCoord = a_texCoord;
    gl_Position = u_viewProjection * vec4(a_position, 1);
}
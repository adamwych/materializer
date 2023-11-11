#version 300 es
precision highp float;

in vec3 a_position;
in vec2 a_texCoord;
in mat4 i_transformMatrix;

out vec2 v_texCoord;
flat out int v_instanceId;

void main(void) {
    gl_Position = i_transformMatrix * vec4(a_position, 1);
    v_texCoord = a_texCoord;
    v_instanceId = gl_InstanceID;
}
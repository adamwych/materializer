#version 300 es
precision highp float;

out vec2 a_texCoord;
out vec3 vPosition;

void main(void) {
    float x = float((gl_VertexID & 1) << 2);
    float y = float((gl_VertexID & 2) << 1);
    a_texCoord.x = x * 0.5f;
    a_texCoord.y = y * 0.5f;
    vPosition = vec3(x - 1.0f, y - 1.0f, 0);
    gl_Position = vec4(vPosition, 1);
}
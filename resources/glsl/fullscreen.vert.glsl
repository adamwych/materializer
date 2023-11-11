#version 300 es
precision highp float;

out vec2 a_texCoord;

void main(void) {
    float x = float((gl_VertexID & 1) << 2);
    float y = float((gl_VertexID & 2) << 1);
    a_texCoord.x = x * 0.5f;
    a_texCoord.y = y * 0.5f;
    gl_Position = vec4(x - 1.0f, y - 1.0f, 0, 1);
}
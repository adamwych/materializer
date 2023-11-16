#version 300 es
precision highp float;

in vec3 aPosition;

uniform mat4 uProjection;
uniform mat4 uView;

out vec3 vPosition;

void main() {
    vPosition = aPosition;

    mat4 rotView = mat4(mat3(uView)); // remove translation from the view matrix
    vec4 clipPos = uProjection * rotView * vec4(aPosition, 1.0f);

    gl_Position = clipPos.xyww;
}
#version 300 es
precision highp float;

in vec3 aPosition;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;

out vec3 vPosition;

void main(void) {
    vPosition = aPosition;
    gl_Position = uProjectionMatrix * uViewMatrix * vec4(aPosition, 1.0f);
}
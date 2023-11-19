#version 300 es
precision highp float;

in vec3 aPosition;
in vec2 aTexCoords;

uniform mat4 uTransformMatrix;
out vec2 vTexCoords;

void main(void) {
    vTexCoords = aTexCoords;
    gl_Position = uTransformMatrix * vec4(aPosition, 1);
}
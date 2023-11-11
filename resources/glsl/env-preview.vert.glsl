#version 300 es
precision highp float;

in vec3 aPosition;
in vec3 aNormal;
in vec2 aTexCoords;

uniform mat4 uTransformMatrix;

out vec3 vNormal;
out vec2 vTexCoords;

void main(void) {
    vNormal = aNormal;
    vTexCoords = aTexCoords;
    gl_Position = uTransformMatrix * vec4(aPosition, 1);
}
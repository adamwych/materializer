#version 300 es
precision highp float;

in vec3 aPosition;
in vec3 aNormal;
in vec3 aTangent;
in vec2 aTexCoords;

uniform mat4 uCameraMatrix;

out vec3 vNormal;
out vec2 vTexCoords;
out mat3 vTBN;

void main(void) {
    vec3 T = normalize(vec3(aTangent.xyz));
    vec3 N = normalize(vec3(aNormal.xyz));
    vec3 B = cross(N, T);
    vTBN = mat3(T, B, N);
    vNormal = aNormal;
    vTexCoords = aTexCoords;
    gl_Position = uCameraMatrix * vec4(aPosition, 1);
}
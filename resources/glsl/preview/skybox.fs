#version 300 es
precision highp float;

in vec3 vPosition;

uniform samplerCube uEnvironmentMap;

out vec4 outColor;

void main() {
    vec3 envColor = texture(uEnvironmentMap, vPosition).rgb;
    outColor = vec4(envColor, 1.0f);
}
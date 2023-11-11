#version 300 es
precision highp float;

in vec3 vNormal;
in vec2 vTexCoords;

uniform sampler2D uAlbedoTexture;

out vec4 outColor;

void main(void) {
    outColor = texture(uAlbedoTexture, 1.0f - vTexCoords);
}
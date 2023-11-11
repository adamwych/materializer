#version 300 es
precision highp float;

in vec2 vTexCoords;

uniform sampler2D uNodeTexture;

out vec4 outColor;

void main(void) {
    outColor = texture(uNodeTexture, vTexCoords);
}
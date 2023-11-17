#version 300 es
precision highp float;

in vec2 vTexCoords;

uniform sampler2D uTexture;
uniform bool uFlipY;
uniform bool uOutputSRGB;

out vec4 outColor;

void main(void) {
    vec2 uv = vTexCoords;

    if(uFlipY) {
        uv.y = 1.0f - uv.y;
    }

    outColor = texture(uTexture, uv);

    if(uOutputSRGB) {
        outColor = pow(outColor, vec4(2.2f));
    }
}
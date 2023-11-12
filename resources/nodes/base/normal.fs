#version 300 es
precision highp float;

in vec2 a_texCoord;

uniform sampler2D i_colorIn;

out vec4 out_colorOut;

vec3 getColorAtOffset(vec2 pxOffset) {
    vec2 offset = pxOffset / 2048.0f;
    return texture(i_colorIn, a_texCoord + offset).rgb;
}

float mapComponent(float v) {
    return (v + 1.0f) / 2.0f;
}

float intensity(vec3 v) {
    return (v.r + v.g + v.b) / 3.0f;
}

vec2[8] offsets = vec2[](vec2(-1.0f, -1.0f), vec2(0.0f, -1.0f), vec2(1.0f, -1.0f), vec2(1.0f, 0.0f), vec2(1.0f, 1.0f), vec2(0.0f, -1.0f), vec2(-1.0f, 1.0f), vec2(-1.0f, 0.0f));

void main(void) {
    vec3[8] colors;

    for(int i = 0; i < 8; i++) {
        vec2 offset = offsets[i];
        colors[i] = getColorAtOffset(offset);
    }

    // sobel filter
    float tr = intensity(colors[0]);
    float t = intensity(colors[1]);
    float tl = intensity(colors[2]);
    float r = intensity(colors[3]);
    float br = intensity(colors[4]);
    float b = intensity(colors[5]);
    float bl = intensity(colors[6]);
    float l = intensity(colors[7]);

    float dX = (tr + 2.0f * r + br) - (tl + 2.0f * l + bl);
    float dY = (bl + 2.0f * b + br) - (tl + 2.0f * t + tr);
    float dZ = 1.0f / 1000.0f;

    vec3 d = normalize(vec3(dX, dY, dZ));

    out_colorOut = vec4(0, 0, 0, 1);
    out_colorOut.r = mapComponent(d.x);
    out_colorOut.g = mapComponent(d.y);
    out_colorOut.b = mapComponent(d.z);
}
#version 300 es
precision highp float;

in vec3 vPosition;

uniform sampler2D uTexture;

out vec4 outColor;

const vec2 invAtan = vec2(0.1591f, 0.3183f);

vec2 sampleSphericalMap(vec3 v) {
    vec2 uv = vec2(atan(v.z, v.x), asin(v.y));
    uv *= invAtan;
    uv += 0.5f;
    uv.y = 1.0f - uv.y;
    return uv;
}

void main(void) {
    outColor = texture(uTexture, sampleSphericalMap(normalize(vPosition)));
}
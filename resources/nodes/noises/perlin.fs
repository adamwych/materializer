#version 300 es
precision highp float;

in vec2 a_texCoord;

uniform vec2 p_offset;
uniform float p_sharpness;
uniform float p_scale;
uniform int p_levels;

out vec4 out_color;

vec2 hash(vec2 co) {
    float m = dot(co, vec2(12.9898f, 78.233f));
    return fract(vec2(sin(m), cos(m)) * 43758.5453f) * 2.f - 1.f;
}

float fade(float t) {
    return t * t * t * (t * (t * 6.f - 15.f) + 10.f);
}

float perlin(vec2 uv) {
    vec2 PT = floor(uv);
    vec2 pt = fract(uv);
    vec2 mmpt = vec2(fade(pt.x), fade(pt.y));

    float g1 = dot(hash(PT + vec2(.0f, 1.f)), pt - vec2(.0f, 1.f));
    float g2 = dot(hash(PT + vec2(1.f, 1.f)), pt - vec2(1.f, 1.f));
    float g3 = dot(hash(PT + vec2(.0f, .0f)), pt - vec2(.0f, .0f));
    float g4 = dot(hash(PT + vec2(1.f, .0f)), pt - vec2(1.f, 0.f));

    vec4 grads = vec4(g1, g2, g3, g4);

    return p_sharpness * mix(mix(grads.z, grads.w, mmpt.x), mix(grads.x, grads.y, mmpt.x), mmpt.y);
}

void main(void) {
    out_color = vec4(0, 0, 0, 1);

    vec2 uv = a_texCoord;
    uv += p_offset;
    uv *= p_scale;

    float n = 0.0f;
    float amplitude = 0.5f;

    for(int i = 0; i < p_levels; i++) {
        n += amplitude * perlin(uv);
        uv *= 2.0f;
        amplitude *= 0.5f;
    }

    out_color += vec4(vec3(n * 0.5f + 0.5f), 1.0f);
}
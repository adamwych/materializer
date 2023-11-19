#version 300 es
precision highp float;
precision highp int;

in vec2 a_texCoord;

uniform int p_direction;
uniform int p_stripes;
uniform float p_seed;

out vec4 out_color;

float randd(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898f, 78.233f))) * 43758.5453f);
}

void main(void) {
    float stripes = float(p_stripes);
    float value = 0.0f;

    if(p_direction == 0) {
        float x = (floor(a_texCoord.x * stripes) / stripes) + 1.0f;
        float d = x * stripes * (1.0f - p_seed);
        float offset = randd(vec2(d, d));
        value = abs(a_texCoord.y - offset) * 1.5f;
    } else {
        float y = (floor(a_texCoord.y * stripes) / stripes) + 1.0f;
        float d = y * stripes * (1.0f - p_seed);
        float offset = randd(vec2(d, d));
        value = abs(a_texCoord.x - offset) * 1.5f;
    }

    out_color = vec4(value, value, value, 1);
}
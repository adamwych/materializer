#version 300 es
precision highp float;

in vec2 a_texCoord;

uniform vec2 p_offset;
uniform float p_scale;
uniform float p_limit;

out vec4 out_color;

vec2 random2f(ivec2 x) {
    vec2 p = vec2(float(x.x), float(x.y));
    return fract(sin(vec2(dot(p, vec2(127.1f, 311.7f)), dot(p, vec2(269.5f, 183.3f)))) * 43758.5453f);
}

// Based on: https://iquilezles.org/articles/voronoilines/

float voronoiDistance(vec2 x) {
    ivec2 p = ivec2(floor(x));
    vec2 f = fract(x);

    ivec2 mb;
    vec2 mr;

    float res = 8.0f;
    for(int j = -1; j <= 1; j++) {
        for(int i = -1; i <= 1; i++) {
            ivec2 b = ivec2(i, j);
            vec2 r = vec2(b) + random2f(p + b) - f;
            float d = dot(r, r);

            if(d < res) {
                res = d;
                mr = r;
                mb = b;
            }
        }
    }

    res = 8.0f;
    for(int j = -2; j <= 2; j++) {
        for(int i = -2; i <= 2; i++) {
            ivec2 b = mb + ivec2(i, j);
            vec2 r = vec2(b) + random2f(p + b) - f;
            float d = dot(0.5f * (mr + r), normalize(r - mr));

            res = min(res, d);
        }
    }

    return res;
}

void main(void) {
    vec2 uv = (a_texCoord + p_offset) * p_scale;

    float m_dist = voronoiDistance(uv);
    m_dist = smoothstep(0.0f, p_limit, m_dist);

    out_color = vec4(vec3(m_dist), 1.0f);
}
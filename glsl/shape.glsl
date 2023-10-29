#version 300 es
precision highp float;

in vec2 a_texCoord;

uniform int p_shape;
uniform float p_rectWidth;
uniform float p_rectHeight;
uniform float p_circleRadius;
uniform float p_triangleSize;

out vec4 out_color;

#define SHAPE_RECTANGLE 0
#define SHAPE_CIRCLE 1
#define SHAPE_TRIANGLE 2

// SDFs adapted from https://iquilezles.org/

float sdfRect(vec2 uv, vec2 size) {
    vec2 d = abs(uv) - size;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

float sdfCircle(vec2 uv, float radius) {
    return length(uv) - radius;
}

float sdfTriangle(vec2 uv, float r) {
    const float k = sqrt(3.0);
    uv.x = abs(uv.x) - r;
    uv.y = uv.y + r/k;
    if (uv.x + k * uv.y > 0.0) {
        uv = vec2(uv.x-k*uv.y,-k*uv.x-uv.y) / 2.0;
    }
    uv.x -= clamp(uv.x, -2.0 * r, 0.0);
    return -length(uv) * sign(uv.y);
}

float shape(vec2 uv) {
    switch (p_shape) {
        case SHAPE_RECTANGLE: return sdfRect(uv, vec2(p_rectWidth / 2.0, p_rectHeight / 2.0));
        case SHAPE_CIRCLE: return sdfCircle(uv, p_circleRadius / 2.0);
        case SHAPE_TRIANGLE: return sdfTriangle(uv + vec2(0, 0.1), p_triangleSize / 2.0);
    }

    return 0.0;
}

void main(void) {
    float d = step(0.0, shape(a_texCoord - vec2(0.5, 0.5)));
    out_color = vec4(1.0 - d);
    out_color.a = 1.0;
}
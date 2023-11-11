#version 300 es
precision highp float;

in vec2 a_texCoord;

uniform float p_offsetX;
uniform float p_offsetY;
uniform float p_rotation;
uniform float p_scaleX;
uniform float p_scaleY;
uniform int p_wrapMode;

uniform sampler2D i_in;

out vec4 out_color;

#define WRAP_MODE_CLAMP 0 
#define WRAP_MODE_REPEAT 1
#define WRAP_MODE_CUTOUT 2

vec2 translateUV(vec2 uv, vec2 translation) {
    return vec2(mod(uv.x + p_offsetX, 1.0f), mod(uv.y + p_offsetY, 1.0f));
}

vec2 rotateUV(vec2 uv, float rotation, vec2 pivot) {
    return vec2(cos(rotation) * (uv.x - pivot.x) + sin(rotation) * (uv.y - pivot.y) + pivot.x, cos(rotation) * (uv.y - pivot.y) - sin(rotation) * (uv.x - pivot.x) + pivot.y);
}

vec2 scaleUV(vec2 uv, vec2 scale, vec2 pivot) {
    return vec2((uv.x - pivot.x) / scale.x + pivot.x, (uv.y - pivot.y) / scale.y + pivot.y);
}

void main(void) {
    vec2 uv = vec2(0.0f);
    uv = translateUV(a_texCoord, vec2(p_offsetX, p_offsetY));
    uv = rotateUV(uv, radians(360.0f - p_rotation), vec2(0.5f, 0.5f));
    uv = scaleUV(uv, vec2(p_scaleX, p_scaleY), vec2(0.5f, 0.5f));

    if(p_wrapMode == WRAP_MODE_REPEAT) {
        uv.x = mod(uv.x, 1.0f);
        uv.y = mod(uv.y, 1.0f);
    } else if(p_wrapMode == WRAP_MODE_CUTOUT) {
        if(uv.x < 0.0f || uv.x > 1.0f || uv.y < 0.0f || uv.y > 1.0f) {
            discard;
        }
    }

    out_color = texture(i_in, uv);
}
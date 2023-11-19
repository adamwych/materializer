#version 300 es
precision highp float;

in vec2 a_texCoord;

uniform int p_direction;

out vec4 out_color;

void main(void) {
    float value = 0.0f;

    switch(p_direction) {
        case 0:
            value = 1.0f - a_texCoord.y;
            break;
        case 1:
            value = a_texCoord.y;
            break;
        case 2:
            value = 1.0f - a_texCoord.x;
            break;
        case 3:
            value = a_texCoord.x;
            break;
    }

    out_color = vec4(value, value, value, 1);
}
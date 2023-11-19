#version 300 es
precision highp float;

in vec2 a_texCoord;

uniform float p_intensity;
uniform int p_size;

uniform int x_textureSize;
uniform int x_passIndex;

uniform sampler2D i_in;

out vec4 out_color;

const int M = 16;
const float coeffs[M + 1] = float[M + 1](0.04425662519949865f, 0.044035873841196206f, 0.043380781642569775f, 0.04231065439216247f, 0.040856643282313365f, 0.039060328279673276f, 0.0369716985390341f, 0.03464682117793548f, 0.03214534135442581f, 0.0295279624870386f, 0.02685404941667096f, 0.02417948052890078f, 0.02155484948872149f, 0.019024086115486723f, 0.016623532195728208f, 0.014381474814203989f, 0.012318109844189502f);

void main(void) {
    vec2 direction = x_passIndex == 0 ? vec2(1.0f / float(x_textureSize), 0.0f) : vec2(0.0f, 1.0f / float(x_textureSize));
    direction = direction * p_intensity;

    out_color = coeffs[0] * texture(i_in, a_texCoord);

    for(int i = 1; i < M; i += 2) {
        float w0 = coeffs[i];
        float w1 = coeffs[i + 1];

        float w = w0 + w1;
        float t = w1 / w;

        out_color += w * texture(i_in, a_texCoord + direction * (float(i) + t));
        out_color += w * texture(i_in, a_texCoord - direction * (float(i) + t));
    }
}
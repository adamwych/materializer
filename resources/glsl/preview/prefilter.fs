#version 300 es

#define M_PI 3.14159265359

precision highp float;

in vec3 vPosition;

uniform samplerCube uTexture;
uniform float value;

out vec4 outColor;

float RadicalInverse_VdC(uint bits) {
    bits = (bits << 16u) | (bits >> 16u);
    bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
    bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
    bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
    bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
    return float(bits) * 2.3283064365386963e-10f; // / 0x100000000
}

vec2 Hammersley(uint i, uint N) {
    return vec2(float(i) / float(N), RadicalInverse_VdC(i));
}

float D_GGX(float NdotH, float roughness) {
    float a = NdotH * roughness;
    float k = roughness / (1.0f - NdotH * NdotH + a * a);
    return k * k * (1.0f / M_PI);
}

vec4 ImportanceSampleGGX(vec2 Xi, vec3 N, float roughness) {
    float a = roughness * roughness;

    float phi = 2.0f * M_PI * Xi.x;
    float cosTheta = sqrt((1.0f - Xi.y) / (1.0f + (a * a - 1.0f) * Xi.y));
    float sinTheta = sqrt(1.0f - cosTheta * cosTheta);

    // from spherical coordinates to cartesian coordinates
    vec3 H;
    H.x = cos(phi) * sinTheta;
    H.y = sin(phi) * sinTheta;
    H.z = cosTheta;

    // from tangent-space vector to world-space sample vector
    vec3 up = abs(N.z) < 0.999f ? vec3(0.0f, 0.0f, 1.0f) : vec3(1.0f, 0.0f, 0.0f);
    vec3 tangent = normalize(cross(up, N));
    vec3 bitangent = cross(N, tangent);

    vec3 sampleVec = tangent * H.x + bitangent * H.y + N * H.z;

    float pdf = D_GGX(cosTheta, a);
    // Apply the Jacobian to obtain a pdf that is parameterized by l
    // see https://bruop.github.io/ibl/
    // Typically you'd have the following:
    // float pdf = D_GGX(NoH, roughness) * NoH / (4.0 * VoH);
    // but since V = N => VoH == NoH
    pdf /= 4.0f;

    return vec4(normalize(sampleVec), pdf);
}

void main(void) {
    vec3 N = normalize(vPosition);
    vec3 R = N;
    vec3 V = R;

    const uint SAMPLE_COUNT = 128u;
    float totalWeight = 0.0f;
    vec3 prefilteredColor = vec3(0.0f);
    for(uint i = 0u; i < SAMPLE_COUNT; ++i) {
        vec2 Xi = Hammersley(i, SAMPLE_COUNT);
        vec4 H = ImportanceSampleGGX(Xi, N, value);

        float pdf = H.w;
        float lod = 0.5f * log2(6.0f * float(256) * float(256) / (float(SAMPLE_COUNT) * pdf));

        vec3 V = N;
        vec3 L = normalize(reflect(-V, H.xyz));
        float NdotL = dot(N, L);

        if(NdotL > 0.0f) {
            if(value == 0.0f) {
                lod = 0.0f;
            }

            vec3 sampleColor = textureLod(uTexture, L, lod).rgb;
            prefilteredColor += sampleColor * NdotL;
            totalWeight += NdotL;
        }
    }
    prefilteredColor = prefilteredColor / totalWeight;
    outColor = vec4(prefilteredColor, 1.0f);
}
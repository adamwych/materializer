#version 300 es

#define M_PI 3.14159265359

precision highp float;

in vec3 vPosition;

uniform samplerCube uTexture;

out vec4 outColor;

// Mirror binary digits about the decimal point
float radicalInverse_VdC(uint bits) {
    bits = (bits << 16u) | (bits >> 16u);
    bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
    bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
    bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
    bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
    return float(bits) * 2.3283064365386963e-10f; // / 0x100000000
}

vec2 hammersley(uint i, int N) {
    return vec2(float(i) / float(N), radicalInverse_VdC(i));
}

vec3 importanceSampleGGX(vec2 Xi, vec3 N, float Roughness) {
    float a = Roughness * Roughness;
    float Phi = 2.0f * M_PI * Xi.x;
    float CosTheta = sqrt((1.0f - Xi.y) / (1.0f + (a * a - 1.0f) * Xi.y));
    float SinTheta = sqrt(1.0f - CosTheta * CosTheta);
    vec3 H;
    H.x = SinTheta * cos(Phi);
    H.y = SinTheta * sin(Phi);
    H.z = CosTheta;
    vec3 UpVector = abs(N.z) < 0.999f ? vec3(0, 0, 1) : vec3(1, 0, 0);
    vec3 TangentX = normalize(cross(UpVector, N));
    vec3 TangentY = cross(N, TangentX);
    // Tangent to world space
    return TangentX * H.x + TangentY * H.y + N * H.z;
}

void main(void) {
    vec3 irradiance = vec3(0.0f);

    vec3 N = normalize(vPosition);

    const int SAMPLE_COUNT = 16384;
    float totalWeight = 0.0f;
    for(int i = 0; i < SAMPLE_COUNT; ++i) {
        vec2 Xi = hammersley(uint(i), SAMPLE_COUNT);
        vec3 H = importanceSampleGGX(Xi, N, 1.0f);

        // NdotH is equal to cos(theta)
        float NdotH = max(dot(N, H), 0.0f);
        // With roughness == 1 in the distribution function we get 1/pi
        float D = 1.0f / M_PI;
        float pdf = (D * NdotH / (4.0f)) + 0.0001f;

        float resolution = 512.0f; // resolution of source cubemap (per face)
        // with a higher resolution, we should sample coarser mipmap levels
        float saTexel = 4.0f * M_PI / (6.0f * resolution * resolution);
        // as we take more samples, we can sample from a finer mipmap.
        // And places where H is more likely to be sampled (higher pdf) we
        // can use a finer mipmap, otherwise use courser mipmap.
        float saSample = 1.0f / (float(SAMPLE_COUNT) * pdf + 0.0001f);

        float mipLevel = 0.5f * log2(saSample / saTexel);

        irradiance += textureLod(uTexture, H, mipLevel).rgb * NdotH;
        totalWeight += NdotH;
    }
    irradiance = (M_PI * irradiance) / totalWeight;

    outColor = vec4(irradiance, 1.0f);
}
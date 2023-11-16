#version 300 es
precision highp float;

#define M_PI 3.14159265359

in vec3 vNormal;
in vec2 vTexCoords;
in mat3 vTBN;

uniform sampler2D uBaseColorTexture;
uniform sampler2D uNormalMapTexture;
uniform sampler2D uMetallicTexture;
uniform sampler2D uRoughnessTexture;
uniform sampler2D uAOTexture;
uniform samplerCube uIrradianceMap;
uniform samplerCube uPrefilterTexture;
uniform sampler2D uBRDFLookupTexture;

uniform vec3 uCameraPos;
uniform bool uHasNormalMap;

out vec4 outColor;

struct WorldInputs {
    vec3 modelPosition;
};

struct MaterialInputs {
    vec3 baseColor;
    vec3 normal;
    float metallic;
    float roughness;
    float perceptualRoughness;
    float ao;
    vec3 f0;
    float specularWeight;
    float environmentExposure;
};

WorldInputs collectWorldInputs() {
    vec3 modelPosition = vec3(0, 0, 0);
    return WorldInputs(modelPosition);
}

MaterialInputs collectMaterialInputs() {
    MaterialInputs inputs;

    if(uHasNormalMap) {
        vec3 tangentNormal = normalize(texture(uNormalMapTexture, vTexCoords).xyz * 2.0f - 1.0f);
        inputs.normal = normalize(vTBN * tangentNormal);
    } else {
        inputs.normal = normalize(vNormal);
    }

    inputs.baseColor = pow(texture(uBaseColorTexture, vTexCoords).rgb, vec3(2.2f));
    inputs.metallic = texture(uMetallicTexture, vTexCoords).r;
    inputs.ao = texture(uAOTexture, vTexCoords).r;

    float perceptualRoughness = texture(uRoughnessTexture, vTexCoords).r;
    perceptualRoughness = clamp(perceptualRoughness, 0.089f, 1.0f);
    inputs.roughness = perceptualRoughness * perceptualRoughness;
    inputs.perceptualRoughness = perceptualRoughness;

    inputs.f0 = vec3(0.04f);
    inputs.f0 = mix(inputs.f0, inputs.baseColor, inputs.metallic);

    inputs.specularWeight = 1.0f;
    inputs.environmentExposure = 1.0f;

    return inputs;
}

float clampedDot(vec3 x, vec3 y) {
    return clamp(dot(x, y), 0.0f, 1.0f);
}

// IBL implementation based on: https://github.com/KhronosGroup/glTF-Sample-Viewer

vec3 getIBLRadianceGGX(vec3 n, vec3 v, MaterialInputs material) {
    float specularWeight = 1.0f;

    float NdotV = clampedDot(n, v);
    float lod = material.perceptualRoughness * float(4 - 1);
    vec3 reflection = normalize(reflect(-v, n));

    vec2 brdfSamplePoint = clamp(vec2(NdotV, material.perceptualRoughness), vec2(0.0f, 0.0f), vec2(1.0f, 1.0f));
    vec2 f_ab = texture(uBRDFLookupTexture, brdfSamplePoint).rg;
    vec4 specularSample = textureLod(uPrefilterTexture, reflection, lod);

    vec3 specularLight = specularSample.rgb;

    // see https://bruop.github.io/ibl/#single_scattering_results at Single Scattering Results
    // Roughness dependent fresnel, from Fdez-Aguera
    vec3 Fr = max(vec3(1.0f - material.perceptualRoughness), material.f0) - material.f0;
    vec3 k_S = material.f0 + Fr * pow(1.0f - NdotV, 5.0f);
    vec3 FssEss = k_S * f_ab.x + f_ab.y;

    return specularWeight * specularLight * FssEss;
}

vec3 getIBLRadianceLambertian(vec3 n, vec3 v, MaterialInputs material) {
    float NdotV = clampedDot(n, v);
    vec2 brdfSamplePoint = clamp(vec2(NdotV, material.perceptualRoughness), vec2(0.0f, 0.0f), vec2(1.0f, 1.0f));
    vec2 f_ab = texture(uBRDFLookupTexture, brdfSamplePoint).rg;

    vec3 irradiance = texture(uIrradianceMap, n).rgb;

    // see https://bruop.github.io/ibl/#single_scattering_results at Single Scattering Results
    // Roughness dependent fresnel, from Fdez-Aguera

    vec3 Fr = max(vec3(1.0f - material.perceptualRoughness), material.f0) - material.f0;
    vec3 k_S = material.f0 + Fr * pow(1.0f - NdotV, 5.0f);
    vec3 FssEss = material.specularWeight * k_S * f_ab.x + f_ab.y; // <--- GGX / specular light contribution (scale it down if the specularWeight is low)

    // Multiple scattering, from Fdez-Aguera
    float Ems = (1.0f - (f_ab.x + f_ab.y));
    vec3 F_avg = material.specularWeight * (material.f0 + (1.0f - material.f0) / 21.0f);
    vec3 FmsEms = Ems * FssEss * F_avg / (1.0f - F_avg * Ems);
    vec3 k_D = material.baseColor * (1.0f - FssEss + FmsEms); // we use +FmsEms as indicated by the formula in the blog post (might be a typo in the implementation)

    k_D *= 1.0f - material.metallic;

    irradiance = vec3(1.0f) - exp(-irradiance * material.environmentExposure);

    return (FmsEms + k_D) * irradiance;
}

void main(void) {
    WorldInputs world = collectWorldInputs();
    MaterialInputs material = collectMaterialInputs();

    vec3 N = material.normal;
    vec3 V = normalize(uCameraPos - world.modelPosition);

    vec3 specular = getIBLRadianceGGX(N, V, material);
    vec3 diffuse = getIBLRadianceLambertian(N, V, material);

    outColor = vec4((diffuse + specular) * material.ao, 1);
}

#version 300 es

#define M_PI 3.14159265359

precision highp float;

in vec3 vNormal;
in vec2 vTexCoords;
in mat3 vTBN;

uniform sampler2D uAlbedoTexture;
uniform sampler2D uNormalMapTexture;
uniform sampler2D uMetallicTexture;
uniform sampler2D uRoughnessTexture;
uniform sampler2D uAOTexture;

uniform vec3 uCameraPos;
uniform bool uHasNormalMap;

out vec4 outColor;

struct WorldInputs {
    vec3 modelPosition;
    vec3 lightPosition;
};

struct MaterialInputs {
    vec3 albedo;
    vec3 normal;
    float metallic;
    float roughness;
    float ao;
};

WorldInputs collectWorldInputs() {
    vec3 modelPosition = vec3(0, 0, 0);
    vec3 lightPosition = vec3(0.75f, 1.25f, 1.0f);
    return WorldInputs(modelPosition, lightPosition);
}

MaterialInputs collectMaterialInputs() {
    vec3 normal = normalize(vNormal);

    if(uHasNormalMap) {
        vec3 tangentNormal = normalize(texture(uNormalMapTexture, vTexCoords).xyz * 2.0f - 1.0f);
        normal = normalize(vTBN * tangentNormal);
    }

    // Albedo is converted from sRGB to linear space.
    vec3 albedo = pow(texture(uAlbedoTexture, vTexCoords).rgb, vec3(2.2f));
    float metallic = texture(uMetallicTexture, vTexCoords).r;
    float roughness = texture(uRoughnessTexture, vTexCoords).r;
    float ao = texture(uAOTexture, vTexCoords).r;
    return MaterialInputs(albedo, normal, metallic, roughness, ao);
}

// Implementation based on Google's Filament rendering engine docs.
// https://google.github.io/filament/Filament.html

//
// BRDF
//

float D_GGX(float roughness, float NoH, const vec3 h) {
    float oneMinusNoHSquared = 1.0f - NoH * NoH;
    float a = NoH * roughness;
    float k = roughness / (oneMinusNoHSquared + a * a);
    float d = k * k * (1.0f / M_PI);
    return d;
}

float V_SmithGGXCorrelated(float NoV, float NoL, float roughness) {
    float a2 = roughness * roughness;
    float GGXV = NoL * sqrt(NoV * NoV * (1.0f - a2) + a2);
    float GGXL = NoV * sqrt(NoL * NoL * (1.0f - a2) + a2);
    return 0.5f / (GGXV + GGXL);
}

vec3 F_Schlick(float u, vec3 f0) {
    float f = pow(1.0f - u, 5.0f);
    return f + f0 * (1.0f - f);
}

float Fd_Lambert() {
    return 1.0f / M_PI;
}

vec3 calculateSpecular(WorldInputs world, MaterialInputs material) {
    vec3 viewDir = normalize(uCameraPos - world.modelPosition);
    vec3 lightDir = normalize(world.lightPosition - world.modelPosition);
    vec3 h = normalize(viewDir + lightDir);

    float NoV = abs(dot(material.normal, viewDir)) + 1e-5f;
    float NoL = clamp(dot(material.normal, lightDir), 0.0f, 1.0f);
    float NoH = clamp(dot(material.normal, h), 0.0f, 1.0f);
    float LoH = clamp(dot(lightDir, h), 0.0f, 1.0f);

    float roughness = material.roughness * material.roughness;

    float reflectance = 0.5f;
    vec3 F0 = 0.16f * reflectance * reflectance * (1.0f - material.metallic) + material.albedo * material.metallic;

    float D = D_GGX(roughness * roughness, NoH, h);
    float V = V_SmithGGXCorrelated(NoV, NoL, roughness);
    vec3 F = F_Schlick(LoH, F0);

    return (D * V) * F;
}

vec3 calculateDiffuse(MaterialInputs material) {
    vec3 diffuseColor = (1.0f - material.metallic) * material.albedo;
    return diffuseColor * Fd_Lambert();
}

vec3 BRDF(WorldInputs world, MaterialInputs material) {
    vec3 specular = calculateSpecular(world, material);
    vec3 diffuse = calculateDiffuse(material);
    return diffuse + specular;
}

//
// Lighting
//

float calculateDirectionalLight(WorldInputs world, MaterialInputs material) {
    vec3 lightDirection = normalize(world.lightPosition - world.modelPosition);
    float lightIntensity = 5.0f;
    float NoL = clamp(dot(material.normal, lightDirection), 0.0f, 1.0f);
    float illuminance = lightIntensity * NoL;
    return illuminance;
}

void main(void) {
    WorldInputs world = collectWorldInputs();
    MaterialInputs material = collectMaterialInputs();

    vec3 color = BRDF(world, material);
    color *= calculateDirectionalLight(world, material);

    // Add ambient occlusion.
    color += 0.05f * material.albedo * material.ao;

    // Gamma correction.
    color = color / (color + vec3(1.0f));
    color = pow(color, vec3(1.0f / 2.2f));

    outColor = vec4(color, 1);
}
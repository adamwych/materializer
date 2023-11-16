import { GLTF } from "@gltf-transform/core";
import cubeGltf from "../../resources/models/cube.gltf?raw";
import cubeHiRes from "../../resources/models/cube_2k.gltf?raw";
import planeGltf from "../../resources/models/plane.gltf?raw";
import plane2kGltf from "../../resources/models/plane_2k.gltf?raw";
import sphereGltf from "../../resources/models/sphere.gltf?raw";
import meadowHdr from "../../resources/hdri/meadow_2_2k.hdr?url";
import littleParisUnderTowerHdr from "../../resources/hdri/little_paris_under_tower_2k.hdr?url";
import wastelandCloudsHdr from "../../resources/hdri/wasteland_clouds_puresky_2k.hdr?url";
import rustigKoppieHdr from "../../resources/hdri/rustig_koppie_puresky_2k.hdr?url";

import glm from "gl-matrix";

export enum Preview3dShape {
    Plane,
    PlaneHiRes,
    Cube,
    CubeHiRes,
    Sphere,
}

export function get3dPreviewShapeGltf(shape: Preview3dShape): GLTF.IGLTF {
    const SHAPE_TO_GLTF: Record<Preview3dShape, string> = {
        [Preview3dShape.Plane]: planeGltf,
        [Preview3dShape.PlaneHiRes]: plane2kGltf,
        [Preview3dShape.Cube]: cubeGltf,
        [Preview3dShape.CubeHiRes]: cubeHiRes,
        [Preview3dShape.Sphere]: sphereGltf,
    };

    return JSON.parse(SHAPE_TO_GLTF[shape]);
}

export enum Preview3dEnvironmentMap {
    // https://polyhaven.com/a/wasteland_clouds_puresky
    WastelandClouds,
    // https://polyhaven.com/a/meadow_2
    Meadow,
    // https://polyhaven.com/a/little_paris_under_tower
    LittleParisUnderTower,
    // https://polyhaven.com/a/rustig_koppie_puresky
    RustigKoppie,
}

export function get3dPreviewEnvironmentMapUrl(map: Preview3dEnvironmentMap): string {
    const MAP: Record<Preview3dEnvironmentMap, string> = {
        [Preview3dEnvironmentMap.WastelandClouds]: wastelandCloudsHdr,
        [Preview3dEnvironmentMap.Meadow]: meadowHdr,
        [Preview3dEnvironmentMap.LittleParisUnderTower]: littleParisUnderTowerHdr,
        [Preview3dEnvironmentMap.RustigKoppie]: rustigKoppieHdr,
    };

    return MAP[map];
}

export type Preview3dSettings = {
    shape: GLTF.IGLTF;
    environmentMapUrl: string;
    viewportWidth: number;
    viewportHeight: number;
    cameraProjection: glm.mat4;
    cameraView: glm.mat4;
    cameraPosition: glm.vec3;
};

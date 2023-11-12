import { GLTF } from "@gltf-transform/core";
import cubeGltf from "../../resources/models/cube.gltf?raw";
import cubeHiRes from "../../resources/models/cube_2k.gltf?raw";
import planeGltf from "../../resources/models/plane.gltf?raw";
import plane2kGltf from "../../resources/models/plane_2k.gltf?raw";
import sphereGltf from "../../resources/models/sphere.gltf?raw";
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

export type Preview3dSettings = {
    shape: GLTF.IGLTF;
    viewportWidth: number;
    viewportHeight: number;
    cameraTransform: glm.mat4;
    cameraPosition: glm.vec3;
};

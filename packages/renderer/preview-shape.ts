import planeGltf from "../../resources/models/plane.gltf?raw";
import cubeGltf from "../../resources/models/cube.gltf?raw";
import { GLTF } from "@gltf-transform/core";

export enum EnvironmentalPreviewShape {
    Plane,
    Cube,
}

export function getEnvPreviewShapeGltf(shape: EnvironmentalPreviewShape): GLTF.IGLTF {
    switch (shape) {
        case EnvironmentalPreviewShape.Plane:
            return JSON.parse(planeGltf);
        case EnvironmentalPreviewShape.Cube:
            return JSON.parse(cubeGltf);
    }
}

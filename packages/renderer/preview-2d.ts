import glm from "gl-matrix";

export type Preview2dSettings = {
    viewportWidth: number;
    viewportHeight: number;
    cameraProjection: glm.mat4;
    cameraView: glm.mat4;
};

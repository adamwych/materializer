import * as glm from "gl-matrix";
import { Preview2dSettings } from "../../../renderer/preview-2d";

export default class Preview2dCamera {
    private x = 0;
    private y = 0;
    private scale = 1;

    private projectionMatrix = glm.mat4.create();
    private viewMatrix = glm.mat4.create();

    constructor(
        private viewportWidth: number,
        private viewportHeight: number,
    ) {
        this.scale = viewportWidth / 2;
        this.updateProjectionMatrix();
        this.updateViewMatrix();
    }

    public createSettings(): Partial<Preview2dSettings> {
        return {
            cameraProjection: this.updateProjectionMatrix(),
            cameraView: this.updateViewMatrix(),
        };
    }

    public reset(): Partial<Preview2dSettings> {
        this.x = 0;
        this.y = 0;
        this.scale = this.viewportWidth / 2;
        return this.createSettings();
    }

    public translate(x: number, y: number): Partial<Preview2dSettings> {
        this.x += x;
        this.y += y;

        return {
            cameraView: this.updateViewMatrix(),
        };
    }

    public zoom(amount: number): Partial<Preview2dSettings> {
        this.scale *= amount;

        return {
            cameraView: this.updateViewMatrix(),
        };
    }

    public resize(viewportWidth: number, viewportHeight: number): Partial<Preview2dSettings> {
        this.viewportWidth = viewportWidth;
        this.viewportHeight = viewportHeight;

        return {
            viewportWidth,
            viewportHeight,
            cameraProjection: this.updateProjectionMatrix(),
        };
    }

    private updateProjectionMatrix() {
        return glm.mat4.ortho(
            this.projectionMatrix,
            0,
            this.viewportWidth,
            this.viewportHeight,
            0,
            0,
            1,
        );
    }

    private updateViewMatrix() {
        return glm.mat4.fromRotationTranslationScaleOrigin(
            this.viewMatrix,
            glm.quat.create(),
            [this.x, this.y, 0],
            [this.scale, this.scale, 1],
            [-1, -1, 0],
        );
    }
}

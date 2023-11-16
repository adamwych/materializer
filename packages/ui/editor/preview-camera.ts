import { Preview3dSettings } from "../../renderer/preview-3d";
import { clamp, toRadians } from "../../utils/math";
import * as glm from "gl-matrix";

export default class Preview3dCamera {
    private rotationX = toRadians(90);
    private rotationY = toRadians(0);
    private scale = 2.5;

    private projectionMatrix = glm.mat4.create();
    private viewMatrix = glm.mat4.create();

    constructor(
        private viewportWidth: number,
        private viewportHeight: number,
    ) {
        this.updateProjectionMatrix();
        this.updateViewMatrix();
    }

    public createSettings(): Partial<Preview3dSettings> {
        return {
            cameraPosition: this.calculatePosition(),
            cameraProjection: this.updateProjectionMatrix(),
            cameraView: this.updateViewMatrix(),
        };
    }

    public rotate(amountX: number, amountY: number): Partial<Preview3dSettings> {
        this.rotationX += amountX;
        this.rotationY += amountY;
        this.rotationY = clamp(this.rotationY, -(Math.PI / 2), Math.PI / 2);

        return {
            cameraPosition: this.calculatePosition(),
            cameraView: this.updateViewMatrix(),
        };
    }

    public zoom(amount: number): Partial<Preview3dSettings> {
        this.scale *= amount;

        return {
            cameraPosition: this.calculatePosition(),
            cameraView: this.updateViewMatrix(),
        };
    }

    public resize(viewportWidth: number, viewportHeight: number): Partial<Preview3dSettings> {
        this.viewportWidth = viewportWidth;
        this.viewportHeight = viewportHeight;

        return {
            viewportWidth,
            viewportHeight,
            cameraProjection: this.updateProjectionMatrix(),
        };
    }

    private updateProjectionMatrix() {
        return glm.mat4.perspective(
            this.projectionMatrix,
            toRadians(40),
            this.viewportWidth / this.viewportHeight,
            0.001,
            1000,
        );
    }

    private updateViewMatrix() {
        return glm.mat4.lookAt(this.viewMatrix, this.calculatePosition(), [0, 0, 0], [0, 1, 0]);
    }

    private calculatePosition() {
        return glm.vec3.fromValues(
            this.scale * Math.cos(this.rotationY) * Math.cos(this.rotationX),
            this.scale * Math.sin(this.rotationY),
            this.scale * Math.cos(this.rotationY) * Math.sin(this.rotationX),
        );
    }
}

import * as glMatrix from "gl-matrix";

export default class PreviewCameraController {
    public rotationX = 0 * (Math.PI / 180);
    public rotationY = 0.01 * (Math.PI / 180);
    public zoom = 2;

    public getProjectionMatrix(): glMatrix.mat4 {
        return glMatrix.mat4.perspective(
            glMatrix.mat4.create(),
            40.0 * (Math.PI / 180),
            400.0 / 400.0,
            0.01,
            1000,
        );
    }

    public getViewMatrix(): glMatrix.mat4 {
        return glMatrix.mat4.lookAt(
            glMatrix.mat4.create(),
            glMatrix.vec3.fromValues(
                this.zoom * Math.sin(-this.rotationX) * Math.sin(this.rotationY),
                this.zoom * Math.cos(this.rotationY),
                this.zoom * Math.cos(-this.rotationX) * Math.sin(this.rotationY),
            ),
            glMatrix.vec3.fromValues(0, 0, 0),
            glMatrix.vec3.fromValues(0, 1, 0),
        );
    }

    public getCombinedMatrix(): glMatrix.mat4 {
        return glMatrix.mat4.mul(
            glMatrix.mat4.create(),
            this.getProjectionMatrix(),
            this.getViewMatrix(),
        );
    }
}

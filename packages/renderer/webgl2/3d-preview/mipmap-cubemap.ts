import * as glm from "gl-matrix";
import { toRadians } from "../../../utils/math";
import ShaderProgram from "../shader/program";
import WebGLCubeRenderer from "./cube";

export default function generateMipMapCubeMap(
    gl: WebGL2RenderingContext,
    sourceTexture: WebGLTexture,
    sourceTextureType: number,
    outputWidth: number,
    outputHeight: number,
    shader: ShaderProgram,
): WebGLTexture {
    const captureFBO = gl.createFramebuffer()!;
    const captureRBO = gl.createRenderbuffer()!;

    gl.bindFramebuffer(gl.FRAMEBUFFER, captureFBO);
    gl.bindRenderbuffer(gl.RENDERBUFFER, captureRBO);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, outputWidth, outputHeight);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, captureRBO);

    // Create the texture in which we will store all 6 views.
    const cubemapTexture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemapTexture);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    for (let i = 0; i < 6; i++) {
        gl.texImage2D(
            gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
            0,
            gl.RGBA16F,
            outputWidth,
            outputHeight,
            0,
            gl.RGBA,
            gl.FLOAT,
            null,
        );
    }

    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);

    // ===
    const projectionMatrix = glm.mat4.perspective(glm.mat4.create(), toRadians(90), 1, 0.1, 10);
    const views = [
        glm.mat4.lookAt(glm.mat4.create(), [0, 0, 0], [1, 0, 0], [0, -1, 0]),
        glm.mat4.lookAt(glm.mat4.create(), [0, 0, 0], [-1, 0, 0], [0, -1, 0]),
        glm.mat4.lookAt(glm.mat4.create(), [0, 0, 0], [0, 1, 0], [0, 0, 1]),
        glm.mat4.lookAt(glm.mat4.create(), [0, 0, 0], [0, -1, 0], [0, 0, -1]),
        glm.mat4.lookAt(glm.mat4.create(), [0, 0, 0], [0, 0, 1], [0, -1, 0]),
        glm.mat4.lookAt(glm.mat4.create(), [0, 0, 0], [0, 0, -1], [0, -1, 0]),
    ];

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(sourceTextureType, sourceTexture);

    gl.viewport(0, 0, outputWidth, outputHeight);
    gl.bindFramebuffer(gl.FRAMEBUFFER, captureFBO);

    shader.use((program) => {
        program.setUniformInt("uTexture", 0);
        program.setUniformMatrix4("uProjectionMatrix", false, projectionMatrix);

        const cubeRenderer = new WebGLCubeRenderer(gl);

        const mipLevels = 5;
        for (let mip = 0; mip < mipLevels; mip++) {
            const mipWidth = outputWidth * Math.pow(0.5, mip);
            const mipHeight = outputHeight * Math.pow(0.5, mip);
            gl.bindRenderbuffer(gl.RENDERBUFFER, captureRBO);
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, mipWidth, mipHeight);
            gl.viewport(0, 0, mipWidth, mipHeight);

            const value = mip / (mipLevels - 1);
            program.setUniformFloat("value", value);
            views.forEach((viewMatrix, index) => {
                program.setUniformMatrix4("uViewMatrix", false, viewMatrix);
                gl.framebufferTexture2D(
                    gl.FRAMEBUFFER,
                    gl.COLOR_ATTACHMENT0,
                    gl.TEXTURE_CUBE_MAP_POSITIVE_X + index,
                    cubemapTexture,
                    mip,
                );
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                cubeRenderer.render();
            });
        }

        cubeRenderer.cleanUp();
    });

    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.deleteRenderbuffer(captureRBO);
    gl.deleteFramebuffer(captureFBO);

    return cubemapTexture;
}

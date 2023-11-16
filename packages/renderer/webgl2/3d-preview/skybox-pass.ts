import * as glm from "gl-matrix";
import skyboxFragGlsl from "../../../../resources/glsl/preview/skybox.fs?raw";
import skyboxVertGlsl from "../../../../resources/glsl/preview/skybox.vs?raw";
import ShaderProgram from "../shader/program";
import WebGLCubeRenderer from "./cube";

export default class WebGL3dPreviewSkyboxRenderPass {
    private shader: ShaderProgram;
    private cubeRenderer: WebGLCubeRenderer;

    constructor(private readonly gl: WebGL2RenderingContext) {
        this.shader = new ShaderProgram(this.gl, skyboxVertGlsl, skyboxFragGlsl);
        this.cubeRenderer = new WebGLCubeRenderer(gl);
    }

    public cleanUp() {
        this.cubeRenderer.cleanUp();
    }

    public render(texture: WebGLTexture, projectionMatrix: glm.mat4, viewMatrix: glm.mat4) {
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.shader.use((program) => {
            program.setUniformMatrix4("uProjection", false, projectionMatrix);
            program.setUniformMatrix4("uView", false, viewMatrix);

            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, texture);
            program.setUniformInt("uEnvironmentMap", 0);

            this.cubeRenderer.render();
        });

        this.gl.depthFunc(this.gl.LESS);
        this.gl.disable(this.gl.DEPTH_TEST);
    }
}

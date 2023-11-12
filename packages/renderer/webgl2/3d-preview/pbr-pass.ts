import * as glm from "gl-matrix";
import pbrFragGlsl from "../../../../resources/glsl/preview/pbr.fs?raw";
import pbrVertGlsl from "../../../../resources/glsl/preview/pbr.vs?raw";
import { PbrTargetTextureType } from "../../../types/pbr";
import { MaterialSnapshot } from "../../types";
import Framebuffer from "../framebuffer";
import WebGLNodeRenderer from "../node-renderer";
import BoundShaderProgram from "../shader/bound-program";
import ShaderProgram from "../shader/program";
import WebGL3dPreviewModel from "./model";

export default class WebGL3dPreviewPbrRenderPass {
    private model?: WebGL3dPreviewModel;
    private shader: ShaderProgram;
    private framebuffer: Framebuffer;

    constructor(
        private readonly gl: WebGL2RenderingContext,
        private readonly viewportWidth: number,
        private readonly viewportHeight: number,
        private readonly nodeRenderer: WebGLNodeRenderer,
    ) {
        this.shader = new ShaderProgram(this.gl, pbrVertGlsl, pbrFragGlsl);
        this.framebuffer = new Framebuffer(this.gl);
        this.framebuffer.attachColorTexture(this.viewportWidth, this.viewportHeight);
        this.framebuffer.attachDepthTexture(this.viewportWidth, this.viewportHeight);
    }

    public cleanUp() {
        this.framebuffer.cleanUp();
    }

    public render(material: MaterialSnapshot, cameraPosition: glm.vec3, cameraTransform: glm.mat4) {
        this.framebuffer.bind();

        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.viewport(0, 0, this.viewportWidth, this.viewportHeight);
        this.gl.clearColor(0.1, 0.1, 0.1, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.shader.use((program) => {
            this.renderModel(material, program, cameraPosition, cameraTransform);
        });

        this.gl.disable(this.gl.DEPTH_TEST);

        this.framebuffer.unbind();
    }

    private renderModel(
        material: MaterialSnapshot,
        program: BoundShaderProgram,
        cameraPosition: glm.vec3,
        cameraTransform: glm.mat4,
    ) {
        if (!this.model) {
            console.warn("PBR renderer error: No model set.");
            return;
        }

        this.gl.bindVertexArray(this.model.getVertexArrayObject());

        [
            PbrTargetTextureType.Albedo,
            PbrTargetTextureType.Normal,
            PbrTargetTextureType.Metallic,
            PbrTargetTextureType.Roughness,
            PbrTargetTextureType.AmbientOcclusion,
        ].forEach((targetTexture, index) => {
            const outputNode = Array.from(material.nodes.values()).find(
                ({ node }) =>
                    node.path === "materializer/output" &&
                    node.parameters["targetTexture"] === targetTexture,
            );

            this.gl.activeTexture(this.gl.TEXTURE0 + index);
            program.setUniformInt(this.getTextureUniformName(targetTexture), index);

            if (targetTexture === PbrTargetTextureType.Normal) {
                program.setUniformBool("uHasNormalMap", !!outputNode);
            }

            if (outputNode) {
                this.gl.bindTexture(
                    this.gl.TEXTURE_2D,
                    this.nodeRenderer.getNodeOutputTexture(outputNode.node.id)!,
                );
            } else {
                this.gl.bindTexture(this.gl.TEXTURE_2D, null);
            }
        });

        program.setUniformMatrix4("uCameraMatrix", false, cameraTransform);
        program.setUniformVec("uCameraPos", cameraPosition as Array<number>);

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.model.getIndexBuffer());
        this.gl.drawElements(
            this.gl.TRIANGLES,
            this.model.getNumberOfVertices(),
            this.gl.UNSIGNED_SHORT,
            0,
        );

        this.gl.bindVertexArray(null);
    }

    public setModel(model: WebGL3dPreviewModel) {
        this.model?.cleanUp();
        this.model = model;
    }

    public getModel() {
        return this.model;
    }

    private getTextureUniformName(textureType: PbrTargetTextureType) {
        return {
            [PbrTargetTextureType.Albedo]: "uAlbedoTexture",
            [PbrTargetTextureType.Normal]: "uNormalMapTexture",
            [PbrTargetTextureType.Height]: "uHeightMapTexture",
            [PbrTargetTextureType.Metallic]: "uMetallicTexture",
            [PbrTargetTextureType.Roughness]: "uRoughnessTexture",
            [PbrTargetTextureType.AmbientOcclusion]: "uAOTexture",
        }[textureType];
    }

    public getColorTexture() {
        return this.framebuffer.getColorTexture();
    }
}

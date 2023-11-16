import * as glm from "gl-matrix";
import pbrFragGlsl from "../../../../resources/glsl/preview/pbr.fs?raw";
import pbrVertGlsl from "../../../../resources/glsl/preview/pbr.vs?raw";
import { PbrTargetTextureType } from "../../../types/pbr";
import { MaterialSnapshot } from "../../types";
import WebGLNodeRenderer from "../node-renderer";
import BoundShaderProgram from "../shader/bound-program";
import ShaderProgram from "../shader/program";
import WebGL3dPreviewPbrEnvironmentMap from "./environment-map";
import WebGL3dPreviewModel from "./model";

export default class WebGL3dPreviewPbrRenderPass {
    private shader: ShaderProgram;

    constructor(
        private readonly gl: WebGL2RenderingContext,
        private readonly viewportWidth: number,
        private readonly viewportHeight: number,
        private readonly nodeRenderer: WebGLNodeRenderer,
    ) {
        this.shader = new ShaderProgram(this.gl, pbrVertGlsl, pbrFragGlsl);
    }

    public render(
        model: WebGL3dPreviewModel,
        material: MaterialSnapshot,
        cameraPosition: glm.vec3,
        cameraTransform: glm.mat4,
        environmentMap: WebGL3dPreviewPbrEnvironmentMap,
    ) {
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.viewport(0, 0, this.viewportWidth, this.viewportHeight);
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.shader.use((program) => {
            this.renderModel(
                model,
                material,
                program,
                cameraPosition,
                cameraTransform,
                environmentMap,
            );
        });

        this.gl.disable(this.gl.DEPTH_TEST);
    }

    private renderModel(
        model: WebGL3dPreviewModel,
        material: MaterialSnapshot,
        program: BoundShaderProgram,
        cameraPosition: glm.vec3,
        cameraTransform: glm.mat4,
        environmentMap: WebGL3dPreviewPbrEnvironmentMap,
    ) {
        this.gl.bindVertexArray(model.getVertexArrayObject());

        [
            PbrTargetTextureType.BaseColor,
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

        this.gl.activeTexture(this.gl.TEXTURE0 + 5);
        this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, environmentMap.getIrradianceTexture());
        program.setUniformInt("uIrradianceMap", 5);

        this.gl.activeTexture(this.gl.TEXTURE0 + 6);
        this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, environmentMap.getPrefilterMapTexture());
        program.setUniformInt("uPrefilterTexture", 6);

        this.gl.activeTexture(this.gl.TEXTURE0 + 7);
        this.gl.bindTexture(this.gl.TEXTURE_2D, environmentMap.getBRDFLookupTexture());
        program.setUniformInt("uBRDFLookupTexture", 7);

        program.setUniformMatrix4("uCameraMatrix", false, cameraTransform);
        program.setUniformVec("uCameraPos", cameraPosition as Array<number>);

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, model.getIndexBuffer());
        this.gl.drawElements(
            this.gl.TRIANGLES,
            model.getNumberOfVertices(),
            this.gl.UNSIGNED_SHORT,
            0,
        );

        this.gl.bindVertexArray(null);
    }

    private getTextureUniformName(textureType: PbrTargetTextureType) {
        return {
            [PbrTargetTextureType.BaseColor]: "uBaseColorTexture",
            [PbrTargetTextureType.Normal]: "uNormalMapTexture",
            [PbrTargetTextureType.Height]: "uHeightMapTexture",
            [PbrTargetTextureType.Metallic]: "uMetallicTexture",
            [PbrTargetTextureType.Roughness]: "uRoughnessTexture",
            [PbrTargetTextureType.AmbientOcclusion]: "uAOTexture",
        }[textureType];
    }
}

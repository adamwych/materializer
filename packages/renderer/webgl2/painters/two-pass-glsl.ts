import { MaterialNodePainterInfo } from "../../../material/node-painter";
import TextureFilterMethod from "../../../types/texture-filter";
import { MaterialNodeSnapshot } from "../../types";
import WebGLNodeRenderer from "../node-renderer";
import MaterialNodeShaderProgram from "../node-shader";
import MaterialNodePainter from "./painter";

export default class TwoPassGlslMaterialNodePainter implements MaterialNodePainter {
    private readonly shaderProgram: MaterialNodeShaderProgram;

    constructor(gl: WebGL2RenderingContext, info: MaterialNodePainterInfo) {
        if (info.type !== "glsl-two-pass") {
            throw new Error(
                "TwoPassGlslMaterialNodePainter can only be used for GLSL-based nodes.",
            );
        }

        this.shaderProgram = new MaterialNodeShaderProgram(
            gl,
            `
        #version 300 es
        precision highp float;
        
        out vec2 a_texCoord;
        
        void main(void) {
            float x = float((gl_VertexID & 1) << 2);
            float y = float((gl_VertexID & 2) << 1);
            a_texCoord.x = x * 0.5;
            a_texCoord.y = y * 0.5;
            gl_Position = vec4(x - 1.0, y - 1.0, 0, 1);
        }
        `.trim(),
            info.fragmentShader,
        );
    }

    private renderFirstPass(
        gl: WebGL2RenderingContext,
        inputTextures: ReadonlyMap<string, WebGLTexture | null>,
        nodeRenderer: WebGLNodeRenderer,
        textureSize: number,
    ) {
        const fbo = gl.createFramebuffer()!;
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

        const outputTexture = nodeRenderer.createEmptyTexture(
            textureSize,
            textureSize,
            TextureFilterMethod.Linear,
            false,
            false,
        );

        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            outputTexture,
            0,
        );

        this.renderPass(gl, inputTextures.get("in")!, 0, textureSize);

        gl.deleteFramebuffer(fbo);
        return outputTexture;
    }

    private renderPass(
        gl: WebGL2RenderingContext,
        texture: WebGLTexture,
        passIndex: number,
        textureSize: number,
    ) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(this.shaderProgram.getUniformLocation("x_textureSize"), textureSize);
        gl.uniform1i(this.shaderProgram.getUniformLocation("x_passIndex"), passIndex);
        gl.uniform1i(this.shaderProgram.getUniformLocation("i_in"), 0);
        gl.drawBuffers([gl.COLOR_ATTACHMENT0]);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    public render(
        gl: WebGL2RenderingContext,
        node: MaterialNodeSnapshot,
        inputTextures: ReadonlyMap<string, WebGLTexture | null>,
        nodeRenderer: WebGLNodeRenderer,
    ): void {
        this.shaderProgram.bind();

        Object.values(node.blueprint.parameters).forEach((parameter) => {
            this.shaderProgram.setParameter(parameter, node.node.parameters[parameter.id]);
        });

        const horizontalBlurTexture = this.renderFirstPass(
            gl,
            inputTextures,
            nodeRenderer,
            node.node.textureSize,
        );

        gl.bindFramebuffer(gl.FRAMEBUFFER, nodeRenderer.getPrimaryFramebuffer());
        this.renderPass(gl, horizontalBlurTexture, 1, node.node.textureSize);

        this.shaderProgram.reset();
    }
}

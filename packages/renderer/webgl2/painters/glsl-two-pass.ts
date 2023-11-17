import vertShaderCode from "../../../../resources/glsl/fullscreen.vert.glsl?raw";
import { TwoPassGlslPainterInfo } from "../../../material/node-painter";
import TextureFilterMethod from "../../../types/texture-filter";
import BoundShaderProgram from "../shader/bound-program";
import ShaderProgram from "../shader/program";
import { WebGLNodePaintContext } from "./context";
import WebGLNodePainter from "./painter";

/**
 * A two-pass GLSL node painter is very similar to the single-pass one,
 * except it renders the same node twice and during the second pass,
 * the fragment shader recieves the output of the first pass as the
 * input texture.
 */
export default class TwoPassGlslNodePainter implements WebGLNodePainter {
    private readonly shaderProgram: ShaderProgram;
    private readonly framebuffer: WebGLFramebuffer;
    private texture!: WebGLTexture;
    private textureSize = 0;
    private textureFilter = TextureFilterMethod.Linear;

    constructor(
        private readonly gl: WebGL2RenderingContext,
        info: TwoPassGlslPainterInfo,
    ) {
        this.shaderProgram = new ShaderProgram(gl, vertShaderCode, info.fragmentShader);
        this.framebuffer = gl.createFramebuffer()!;
    }

    public render(context: WebGLNodePaintContext): void {
        const gl = this.gl;
        const { node, renderer } = context;

        this.shaderProgram.use((program) => {
            Object.values(node.blueprint.parameters).forEach((parameter) => {
                program.setNodeParameter(parameter, node.node.parameters[parameter.id]);
            });

            program.setUniformInt("x_textureSize", node.node.textureSize);
            program.setUniformInt("i_in", 0);

            const firstPassOutput = this.renderFirstPass(program, context);

            gl.bindFramebuffer(gl.FRAMEBUFFER, renderer.getPrimaryFramebuffer());
            this.renderPass(1, program, firstPassOutput);
        });
    }

    private renderFirstPass(program: BoundShaderProgram, context: WebGLNodePaintContext) {
        const gl = this.gl;
        const { node, renderer } = context;

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);

        if (
            node.node.textureSize !== this.textureSize ||
            node.node.textureFilterMethod !== this.textureFilter
        ) {
            this.gl.deleteTexture(this.texture);
            this.texture = renderer.createEmptyTexture(
                node.node.textureSize,
                node.node.textureSize,
                node.node.textureFilterMethod,
                false,
            );
            gl.framebufferTexture2D(
                gl.FRAMEBUFFER,
                gl.COLOR_ATTACHMENT0,
                gl.TEXTURE_2D,
                this.texture,
                0,
            );
        }

        this.renderPass(0, program, context.inputTextures.get("in")!);

        return this.texture;
    }

    private renderPass(passIndex: number, program: BoundShaderProgram, texture: WebGLTexture) {
        const gl = this.gl;
        program.setUniformInt("x_passIndex", passIndex);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.drawBuffers([gl.COLOR_ATTACHMENT0]);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
}

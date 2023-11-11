import vertShaderCode from "../../../../resources/glsl/fullscreen.vert.glsl?raw";
import { GlslPainterInfo } from "../../../material/node-painter";
import ShaderProgram from "../shader/program";
import { WebGLNodePaintContext } from "./context";
import WebGLNodePainter from "./painter";

/**
 * A single-pass GLSL node painter renders a node using a fragment shader.
 * This is the simplest node painter, it just renders a fullscreen quad
 * using specified fragment shader.
 */
export default class SinglePassGlslNodePainter implements WebGLNodePainter {
    private readonly shaderProgram: ShaderProgram;

    constructor(
        private readonly gl: WebGL2RenderingContext,
        info: GlslPainterInfo,
    ) {
        this.shaderProgram = new ShaderProgram(gl, vertShaderCode, info.fragmentShader);
    }

    public render(context: WebGLNodePaintContext): void {
        const gl = this.gl;
        const { node, inputTextures } = context;

        this.shaderProgram.use((program) => {
            Object.values(node.blueprint.parameters).forEach((parameter) => {
                program.setNodeParameter(parameter, node.node.parameters[parameter.id]);
            });

            for (const [id, texture] of inputTextures.entries()) {
                program.setNodeInputTexture(id, texture);
            }

            gl.drawBuffers(
                Object.keys(node.blueprint.outputs).map((_, i) => gl.COLOR_ATTACHMENT0 + i),
            );
            gl.drawArrays(gl.TRIANGLES, 0, 3);
        });
    }
}

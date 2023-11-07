import { MaterialNodePainterInfo } from "../../../types/node-painter";
import { MaterialNodeSnapshot } from "../../types";
import MaterialNodeShaderProgram from "../node-shader";
import MaterialNodePainter from "./painter";

export default class GLSLMaterialNodePainter implements MaterialNodePainter {
    private readonly shaderProgram: MaterialNodeShaderProgram;

    constructor(gl: WebGL2RenderingContext, info: MaterialNodePainterInfo) {
        if (info.type !== "glsl") {
            throw new Error("GLSLMaterialNodePainter can only be used for GLSL-based nodes.");
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

    public render(
        gl: WebGL2RenderingContext,
        node: MaterialNodeSnapshot,
        inputTextures: ReadonlyMap<string, WebGLTexture>,
    ): void {
        this.shaderProgram.bind();

        Object.values(node.blueprint.parameters).forEach((parameter) => {
            this.shaderProgram.setParameter(parameter, node.node.parameters[parameter.id]);
        });

        for (const [id, texture] of inputTextures.entries()) {
            this.shaderProgram.setInputTexture(id, texture);
        }

        // Re-bind shader to update texture bindings.
        this.shaderProgram.bind();

        gl.drawBuffers(Object.keys(node.blueprint.outputs).map((_, i) => gl.COLOR_ATTACHMENT0 + i));
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        this.shaderProgram.reset();
    }
}

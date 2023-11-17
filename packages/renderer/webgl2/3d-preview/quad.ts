import { XY_QUAD_VERTICES } from "../../quads";
import ShaderProgram from "../shader/program";

export default class WebGLQuadRenderer {
    private readonly vao: WebGLVertexArrayObject;
    private readonly vbo: WebGLBuffer;

    constructor(private readonly gl: WebGL2RenderingContext) {
        this.vbo = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(XY_QUAD_VERTICES.flatMap((x) => [...x[0], ...x[1]])),
            gl.STATIC_DRAW,
        );

        this.vao = gl.createVertexArray()!;
        gl.bindVertexArray(this.vao);

        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 5 * 4, 0);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 5 * 4, 3 * 4);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }

    public cleanUp() {
        this.gl.deleteBuffer(this.vbo);
        this.gl.deleteVertexArray(this.vao);
    }

    public render() {
        this.gl.bindVertexArray(this.vao);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        this.gl.bindVertexArray(null);
    }

    public renderToTexture(width: number, height: number, shader: ShaderProgram) {
        const gl = this.gl;
        const texture = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG16F, width, height, 0, gl.RG, gl.FLOAT, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        const fbo = gl.createFramebuffer()!;
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

        gl.viewport(0, 0, width, height);

        shader.use(() => {
            gl.clear(gl.COLOR_BUFFER_BIT);
            this.render();
        });

        gl.deleteFramebuffer(fbo);
        return texture;
    }
}

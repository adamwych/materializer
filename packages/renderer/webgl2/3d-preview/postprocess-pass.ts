import ShaderProgram from "../shader/program";
import fxaaVertGlsl from "../../../../resources/glsl/fullscreen.vert.glsl?raw";
import fxaaFragGlsl from "../../../../resources/glsl/preview/fxaa.fs?raw";
import Framebuffer from "../framebuffer";

export default class WebGL3dPreviewFxRenderPass {
    private fxaaShader: ShaderProgram;
    private framebuffer: Framebuffer;

    constructor(
        private readonly gl: WebGL2RenderingContext,
        private readonly viewportWidth: number,
        private readonly viewportHeight: number,
    ) {
        this.fxaaShader = new ShaderProgram(this.gl, fxaaVertGlsl, fxaaFragGlsl);
        this.framebuffer = new Framebuffer(gl);
        this.framebuffer.attachColorTexture(viewportWidth, viewportHeight);
    }

    public cleanUp() {
        this.framebuffer.cleanUp();
    }

    public render(previousColorTexture: WebGLTexture, dstBuffer: ArrayBufferView) {
        this.framebuffer.bind();

        this.gl.viewport(0, 0, this.viewportWidth, this.viewportHeight);
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.fxaaShader.use((program) => {
            program.setUniformFloat("uViewportWidth", this.viewportWidth);
            program.setUniformFloat("uViewportHeight", this.viewportHeight);

            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, previousColorTexture);
            this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);

            // Read pixels from the color attachment and draw them onto the final canvas.
            this.gl.readBuffer(this.gl.COLOR_ATTACHMENT0);
            this.gl.readPixels(
                0,
                0,
                this.viewportWidth,
                this.viewportHeight,
                this.gl.RGBA,
                this.gl.UNSIGNED_BYTE,
                dstBuffer,
            );

            this.gl.bindVertexArray(null);
        });

        this.framebuffer.unbind();
    }
}

import fxaaVertGlsl from "../../../../resources/glsl/fullscreen.vs?raw";
import fxaaFragGlsl from "../../../../resources/glsl/preview/fxaa.fs?raw";
import ShaderProgram from "../shader/program";

export default class WebGL3dPreviewFxRenderPass {
    private fxaaShader: ShaderProgram;

    constructor(
        private readonly gl: WebGL2RenderingContext,
        private readonly viewportWidth: number,
        private readonly viewportHeight: number,
    ) {
        this.fxaaShader = new ShaderProgram(this.gl, fxaaVertGlsl, fxaaFragGlsl);
    }

    public render(previousColorTexture: WebGLTexture, dstBuffer: ArrayBufferView) {
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
    }
}

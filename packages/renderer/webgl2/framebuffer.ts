export default class Framebuffer {
    private framebuffer!: WebGLFramebuffer;

    private colorTexture?: WebGLTexture;
    private colorRenderbuffer!: WebGLRenderbuffer;

    private depthTexture?: WebGLTexture;
    private depthRenderbuffer!: WebGLRenderbuffer;

    constructor(private readonly gl: WebGL2RenderingContext) {
        this.framebuffer = gl.createFramebuffer()!;
        this.colorRenderbuffer = gl.createRenderbuffer()!;
        this.depthRenderbuffer = gl.createRenderbuffer()!;
    }

    public cleanUp() {
        this.gl.deleteFramebuffer(this.framebuffer);
        this.gl.deleteRenderbuffer(this.colorRenderbuffer);
        this.gl.deleteRenderbuffer(this.depthRenderbuffer);
    }

    public attachColorTexture(width: number, height: number, samples: number) {
        const gl = this.gl;

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);

        this.colorTexture = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, this.colorTexture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.SRGB8_ALPHA8,
            width,
            height,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null,
        );
        gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, null);

        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            this.colorTexture,
            0,
        );

        gl.bindRenderbuffer(gl.RENDERBUFFER, this.colorRenderbuffer);

        if (samples > 0) {
            gl.renderbufferStorageMultisample(
                gl.RENDERBUFFER,
                samples,
                gl.SRGB8_ALPHA8,
                width,
                height,
            );
        } else {
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.SRGB8_ALPHA8, width, height);
        }

        gl.framebufferRenderbuffer(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.RENDERBUFFER,
            this.colorRenderbuffer,
        );
    }

    public attachDepthTexture(width: number, height: number, samples: number) {
        const gl = this.gl;

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);

        this.depthTexture = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, this.depthTexture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.DEPTH_COMPONENT32F,
            width,
            height,
            0,
            gl.DEPTH_COMPONENT,
            gl.FLOAT,
            null,
        );
        gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, null);

        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.DEPTH_ATTACHMENT,
            gl.TEXTURE_2D,
            this.depthTexture,
            0,
        );

        gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthRenderbuffer);

        if (samples > 0) {
            gl.renderbufferStorageMultisample(
                gl.RENDERBUFFER,
                samples,
                gl.DEPTH_COMPONENT24,
                width,
                height,
            );
        } else {
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, width, height);
        }

        gl.framebufferRenderbuffer(
            gl.FRAMEBUFFER,
            gl.DEPTH_ATTACHMENT,
            gl.RENDERBUFFER,
            this.depthRenderbuffer,
        );
    }

    public bind() {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
    }

    public bindAsRead() {
        this.gl.bindFramebuffer(this.gl.READ_FRAMEBUFFER, this.framebuffer);
    }

    public bindAsDraw() {
        this.gl.bindFramebuffer(this.gl.DRAW_FRAMEBUFFER, this.framebuffer);
    }

    public unbind() {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }
}

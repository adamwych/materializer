import PreviewCameraController from "../editor/preview/camera.ts";

export default class PreviewShaderProgram {
    private readonly program: WebGLProgram;

    constructor(
        private readonly gl: WebGL2RenderingContext,
        vertexShaderCode: string,
        fragmentShaderCode: string,
    ) {
        const program = gl.createProgram()!;

        const vertexShader = createAndCompileShader(gl, gl.VERTEX_SHADER, vertexShaderCode);

        const fragmentShader = createAndCompileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderCode);

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        this.program = program;
    }

    public bind() {
        this.gl.useProgram(this.program);
    }

    public setCamera(camera: PreviewCameraController) {
        const location = this.gl.getUniformLocation(this.program, "u_viewProjection");
        if (location) {
            this.gl.uniformMatrix4fv(location, false, camera.getCombinedMatrix());
        }
    }

    public getProgram() {
        return this.program;
    }
}

function createAndCompileShader(gl: WebGL2RenderingContext, type: number, code: string) {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, code);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader)!);
    }

    return shader;
}

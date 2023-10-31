export default function createAndCompileShader(
    gl: WebGL2RenderingContext,
    type: number,
    code: string,
) {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, code);
    gl.compileShader(shader);
    return shader;
}

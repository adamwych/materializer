import CacheMap from "../../../utils/CacheMap";
import BoundShaderProgram from "./bound-program";
import preprocessShaderCode from "./preprocessor";

// Keeps track of what shader program is currently bound to avoid
// unnecessary re-binding of the same program, which is pretty expensive.
let boundShaderProgram: WebGLProgram | null = null;

/**
 * A wrapper around {@link WebGLProgram} that provides some methods to make it
 * easier to create shader programs and work with a linked program.
 */
export default class ShaderProgram {
    private readonly program: WebGLProgram;

    private attributeLocationsCache = new CacheMap<string, number>();
    private uniformLocationsCache = new CacheMap<string, WebGLUniformLocation>();

    /**
     * Compiles and links a new shader program which uses the default
     * vertex shader and given fragment shader.
     *
     * @param gl WebGL context.
     * @param vsCode Source code of the vertex shader.
     * @param fsCode Source code of the fragment shader.
     * @returns Constructed shader program.
     */
    constructor(
        private readonly gl: WebGL2RenderingContext,
        vsCode: string,
        fsCode: string,
    ) {
        const vertexShader = this.compileShader(gl, gl.VERTEX_SHADER, vsCode);
        const fragmentShader = this.compileShader(gl, gl.FRAGMENT_SHADER, fsCode);
        const program = gl.createProgram()!;
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        this.program = program;
    }

    /**
     * Creates a new shader of given types, pre-processes the source code and compiles it.
     *
     * @param gl WebGL context.
     * @param type Type of the shader. `gl.VERTEX_SHADER` or `gl.FRAGMENT_SHADER`.
     * @param code Source code of the shader.
     * @returns Compiled shader.
     */
    private compileShader(gl: WebGL2RenderingContext, type: number, code: string) {
        code = preprocessShaderCode(code);
        const shader = gl.createShader(type)!;
        gl.shaderSource(shader, code);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error(gl.getShaderInfoLog(shader)!);
        }

        return shader;
    }

    /**
     * Binds the shader program and calls given callback function.
     * The program is bound only during given callback's execution scope.
     *
     * @param callback
     */
    public use(callback: (program: BoundShaderProgram) => void) {
        if (boundShaderProgram !== null) {
            throw new Error("Stacking shader programs is not supported.");
        }

        this.gl.useProgram(this.program);
        boundShaderProgram = this.program;

        const program = new BoundShaderProgram(this.gl, this);
        callback(program);
        program.cleanUp();

        boundShaderProgram = null;
    }

    /**
     * Retrieves location of an attribute by given name.
     *
     * @param name Name of the attribute to look for.
     * @returns Location of the attribute.
     */
    public getAttributeLocation(name: string) {
        return this.attributeLocationsCache.getOrAdd(name, () =>
            this.gl.getAttribLocation(this.program, name),
        );
    }

    /**
     * Retrieves location of a uniform by given name.
     * If this uniform is not used by the shader, then it will not be found.
     *
     * @param name Name of the uniform to look for.
     * @returns Location of the uniform or `undefined`.
     */
    public getUniformLocation(name: string) {
        return this.uniformLocationsCache.getOrAdd(
            name,
            () => this.gl.getUniformLocation(this.program, name)!,
        );
    }
}

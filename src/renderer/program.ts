import { MaterialNodeParametersMap } from "../types/material.ts";

const PREFIX_PARAMETER = "p_";
const PREFIX_INPUT_TEXTURE = "i_";

export default class MaterialNodeShaderProgram {
    private readonly program: WebGLProgram;
    private inputTextures: Array<WebGLTexture> = [];

    /**
     * Compiles and links a new shader program which uses the default
     * vertex shader and given fragment shader.
     *
     * @param gl
     * @param code
     * @returns
     */
    constructor(
        private readonly gl: WebGL2RenderingContext,
        code: string,
    ) {
        const program = gl.createProgram()!;

        const vertexShader = createAndCompileShader(
            gl,
            gl.VERTEX_SHADER,
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
        );

        const fragmentShader = createAndCompileShader(gl, gl.FRAGMENT_SHADER, code);

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        this.program = program;
    }

    public bind() {
        this.gl.useProgram(this.program);

        for (let i = 0; i < this.inputTextures.length; i++) {
            this.gl.activeTexture(this.gl.TEXTURE0 + i);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.inputTextures[i]);
        }
    }

    public reset() {
        for (let i = 0; i < this.inputTextures.length; i++) {
            this.gl.activeTexture(this.gl.TEXTURE0 + i);
            this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        }

        this.inputTextures = [];
    }

    public setInputTexture(name: string, texture: WebGLTexture | null) {
        this.gl.useProgram(this.program);
        const location = this.gl.getUniformLocation(this.program, PREFIX_INPUT_TEXTURE + name);
        if (location) {
            this.gl.uniform1i(location, this.inputTextures.length);
            if (texture) {
                this.inputTextures.push(texture);
            }
        } else {
            console.warn(`Input texture '${name}' was not found in the fragment shader.`);
        }
    }

    public setParameters(parameters: MaterialNodeParametersMap) {
        this.gl.useProgram(this.program);

        for (const [name, value] of Object.entries(parameters)) {
            switch (typeof value) {
                case "object":
                    if (Array.isArray(value)) {
                        this.setVecParameter(name, value);
                    }
                    break;
                default:
                    console.warn(
                        `Type of node parameter '${name}' (${typeof value}) is not supported.`,
                    );
            }
        }
    }

    public setVecParameter(name: string, value: Array<number>) {
        const location = this.gl.getUniformLocation(this.program, PREFIX_PARAMETER + name);
        if (location) {
            if (value.length === 1) {
                this.gl.uniform1fv(location, value);
            } else if (value.length === 2) {
                this.gl.uniform2fv(location, value);
            } else if (value.length === 3) {
                this.gl.uniform3fv(location, value);
            } else if (value.length === 4) {
                this.gl.uniform4fv(location, value);
            } else {
                console.warn(`Parameter '${name}' has too many values (${value.length})`);
            }
        } else {
            console.warn(`Parameter '${name}' was not found in the fragment shader.`);
        }
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

import { DeepReadonly } from "ts-essentials";
import { MaterialNodeParameterInfo } from "../types/material.ts";

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
     * @param vsCode
     * @param fsCode
     * @returns
     */
    constructor(
        private readonly gl: WebGL2RenderingContext,
        vsCode: string,
        fsCode: string,
    ) {
        const program = gl.createProgram()!;
        const vertexShader = createAndCompileShader(gl, gl.VERTEX_SHADER, vsCode);
        const fragmentShader = createAndCompileShader(gl, gl.FRAGMENT_SHADER, fsCode);
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        this.program = program;
    }

    public getAttributeLocation(name: string) {
        return this.gl.getAttribLocation(this.program, name);
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

    public setParameter(info: DeepReadonly<MaterialNodeParameterInfo>, value: unknown) {
        this.gl.useProgram(this.program);

        switch (info.valueType) {
            case "vec2":
            case "vec3":
            case "vec4":
                this.setVecParameter(info.id, value as Array<number>);
                break;
            case "float":
                this.setFloatParameter(info.id, value as number);
                break;
            case "int":
                this.setIntParameter(info.id, value as number);
                break;
            default:
                console.warn(
                    `Type of node parameter '${name}' (${typeof value}) is not supported.`,
                );
        }
    }

    public setVecParameter(name: string, value: Array<number>) {
        const location = this.gl.getUniformLocation(this.program, PREFIX_PARAMETER + name);
        if (location) {
            if (value.length === 2) {
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

    public setIntParameter(name: string, value: number) {
        const location = this.gl.getUniformLocation(this.program, PREFIX_PARAMETER + name);
        if (location) {
            this.gl.uniform1i(location, value);
        } else {
            console.warn(`Parameter '${name}' was not found in the fragment shader.`);
        }
    }

    public setFloatParameter(name: string, value: number) {
        const location = this.gl.getUniformLocation(this.program, PREFIX_PARAMETER + name);
        if (location) {
            this.gl.uniform1f(location, value);
        } else {
            console.warn(`Parameter '${name}' was not found in the fragment shader.`);
        }
    }

    public setUniformInt(name: string, value: number) {
        const location = this.gl.getUniformLocation(this.program, name);
        if (location) {
            this.gl.uniform1i(location, value);
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

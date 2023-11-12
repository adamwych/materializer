import { MaterialNodeParameterInfo } from "../../../material/node-parameter";
import ShaderProgram from "./program";

const PREFIX_PARAMETER = "p_";
const PREFIX_INPUT_TEXTURE = "i_";

/**
 * Provides utilities to work with currently bound shader program.
 */
export default class BoundShaderProgram {
    /** Keeps track of how many input textures were provided to the shader. */
    private inputTexturesCounter = 0;

    constructor(
        private readonly gl: WebGL2RenderingContext,
        private readonly program: ShaderProgram,
    ) {}

    public cleanUp() {
        for (let i = 0; i < this.inputTexturesCounter; i++) {
            this.gl.activeTexture(this.gl.TEXTURE0 + i);
            this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        }

        this.inputTexturesCounter = 0;
    }

    public setNodeParameter(info: MaterialNodeParameterInfo, value: unknown) {
        switch (info.valueType) {
            case "vec2":
            case "vec3":
            case "vec4":
                this.setUniformVec(PREFIX_PARAMETER + info.id, value as Array<number>);
                break;
            case "float":
                this.setUniformFloat(PREFIX_PARAMETER + info.id, value as number);
                break;
            case "int":
                this.setUniformInt(PREFIX_PARAMETER + info.id, value as number);
                break;
            default:
                console.warn(`Node parameter '${info.name}' (${typeof value}) is not supported.`);
        }
    }

    public setNodeInputTexture(name: string, texture: WebGLTexture | null) {
        const location = this.program.getUniformLocation(PREFIX_INPUT_TEXTURE + name);
        if (location) {
            const index = this.inputTexturesCounter;

            this.gl.uniform1i(location, index);

            if (texture) {
                this.gl.activeTexture(this.gl.TEXTURE0 + index);
                this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
            }

            this.inputTexturesCounter++;
        }
    }

    public setUniformVec(name: string, value: Array<number>) {
        const location = this.program.getUniformLocation(name);
        if (location) {
            if (value.length === 2) {
                this.gl.uniform2fv(location, value);
            } else if (value.length === 3) {
                this.gl.uniform3fv(location, value);
            } else if (value.length === 4) {
                this.gl.uniform4fv(location, value);
            } else {
                console.warn(`Value of uniform '${name}' has too many values (${value.length})`);
            }
        } else {
            console.warn(`Uniform '${name}' was not found in the shader.`);
        }
    }

    public setUniformInt(name: string, value: number) {
        const location = this.program.getUniformLocation(name);
        if (location) {
            this.gl.uniform1i(location, value);
        } else {
            console.warn(`Uniform '${name}' was not found in the shader.`);
        }
    }

    public setUniformBool(name: string, value: boolean) {
        const location = this.program.getUniformLocation(name);
        if (location) {
            this.gl.uniform1i(location, value ? 1 : 0);
        } else {
            console.warn(`Uniform '${name}' was not found in the shader.`);
        }
    }

    public setUniformFloat(name: string, value: number) {
        const location = this.program.getUniformLocation(name);
        if (location) {
            this.gl.uniform1f(location, value);
        } else {
            console.warn(`Uniform '${name}' was not found in the shader.`);
        }
    }

    public setUniformMatrix4(name: string, transpose: boolean, value: Iterable<GLfloat>) {
        const location = this.program.getUniformLocation(name);
        if (location) {
            this.gl.uniformMatrix4fv(location, transpose, value);
        } else {
            console.warn(`Uniform '${name}' was not found in the shader.`);
        }
    }
}

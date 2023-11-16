import hdrjs from "hdr.js";
import fullscreenQuadVertGlsl from "../../../../resources/glsl/fullscreen.vert.glsl?raw";
import brdfLookupFragGlsl from "../../../../resources/glsl/preview/brdf-lookup.fs?raw";
import hdrToCubemapFragGlsl from "../../../../resources/glsl/preview/hdr-to-cubemap.fs?raw";
import hdrToCubemapVertGlsl from "../../../../resources/glsl/preview/hdr-to-cubemap.vs?raw";
import irradianceFragGlsl from "../../../../resources/glsl/preview/irradiance.fs?raw";
import prefilterFragGlsl from "../../../../resources/glsl/preview/prefilter.fs?raw";
import ShaderProgram from "../shader/program";
import generateCubeMap from "./cubemap";
import generateMipMapCubeMap from "./mipmap-cubemap";
import WebGLQuadRenderer from "./quad";

export default class WebGL3dPreviewPbrEnvironmentMap {
    private hdrTexture: WebGLTexture;
    private cubeMapTexture!: WebGLTexture;
    private irradianceTexture!: WebGLTexture;
    private prefilterMapTexture!: WebGLTexture;
    private brdfLookupTexture!: WebGLTexture;

    constructor(
        private readonly gl: WebGL2RenderingContext,
        imageWidth: number,
        imageHeight: number,
        imageData: Float32Array,
    ) {
        this.hdrTexture = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, this.hdrTexture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGB9_E5,
            imageWidth,
            imageHeight,
            0,
            gl.RGB,
            gl.FLOAT,
            imageData,
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        this.cubeMapTexture = generateCubeMap(
            gl,
            this.hdrTexture,
            gl.TEXTURE_2D,
            512,
            512,
            new ShaderProgram(gl, hdrToCubemapVertGlsl, hdrToCubemapFragGlsl),
            true,
        );

        this.irradianceTexture = generateCubeMap(
            gl,
            this.cubeMapTexture,
            gl.TEXTURE_CUBE_MAP,
            128,
            128,
            new ShaderProgram(gl, hdrToCubemapVertGlsl, irradianceFragGlsl),
            false,
        );

        this.prefilterMapTexture = generateMipMapCubeMap(
            gl,
            this.cubeMapTexture,
            gl.TEXTURE_CUBE_MAP,
            256,
            256,
            new ShaderProgram(gl, hdrToCubemapVertGlsl, prefilterFragGlsl),
        );

        const quadRenderer = new WebGLQuadRenderer(gl);
        this.brdfLookupTexture = quadRenderer.renderToTexture(
            512,
            512,
            new ShaderProgram(gl, fullscreenQuadVertGlsl, brdfLookupFragGlsl),
        );
        quadRenderer.cleanUp();
    }

    public cleanUp() {
        this.gl.deleteTexture(this.hdrTexture);
        this.gl.deleteTexture(this.cubeMapTexture);
        this.gl.deleteTexture(this.irradianceTexture);
        this.gl.deleteTexture(this.prefilterMapTexture);
        this.gl.deleteTexture(this.brdfLookupTexture);
    }

    public getHDRTexture() {
        return this.hdrTexture;
    }

    public getCubeMapTexture() {
        return this.cubeMapTexture;
    }

    public getIrradianceTexture() {
        return this.irradianceTexture;
    }

    public getPrefilterMapTexture() {
        return this.prefilterMapTexture;
    }

    public getBRDFLookupTexture() {
        return this.brdfLookupTexture;
    }

    public static async fromUrl(
        gl: WebGL2RenderingContext,
        url: string,
    ): Promise<WebGL3dPreviewPbrEnvironmentMap> {
        const hdr = await hdrjs.load(url);
        return new WebGL3dPreviewPbrEnvironmentMap(gl, hdr.width, hdr.height, hdr.rgbFloat);
    }
}

import * as glm from "gl-matrix";
import fullscreenVertGlsl from "../../../../resources/glsl/simple-quad.vs?raw";
import fullscreenFragGlsl from "../../../../resources/glsl/simple-texture.fs?raw";
import { Preview2dSettings } from "../../preview-2d";
import { MaterialSnapshot } from "../../types";
import WebGLQuadRenderer from "../3d-preview/quad";
import Framebuffer from "../framebuffer";
import WebGLNodeRenderer from "../node-renderer";
import IWebGLPreviewRenderer from "../preview-renderer";
import ShaderProgram from "../shader/program";

export default class WebGL2dPreviewRenderer implements IWebGLPreviewRenderer {
    private readonly context: OffscreenCanvasRenderingContext2D;
    private readonly quadRenderer: WebGLQuadRenderer;
    private readonly fullscreenShader: ShaderProgram;

    private framebuffer!: Framebuffer;
    private imageData!: ImageData;

    private cameraProjection = glm.mat4.create();
    private cameraView = glm.mat4.create();
    private cameraTransform = glm.mat4.create();

    constructor(
        private readonly envCanvas: OffscreenCanvas,
        private readonly gl: WebGL2RenderingContext,
        private readonly nodeRenderer: WebGLNodeRenderer,
    ) {
        this.context = envCanvas.getContext("2d")!;
        this.quadRenderer = new WebGLQuadRenderer(gl);
        this.fullscreenShader = new ShaderProgram(gl, fullscreenVertGlsl, fullscreenFragGlsl);
    }

    public async initialize() {
        await this.updateSettings({
            viewportWidth: this.envCanvas.width,
            viewportHeight: this.envCanvas.height,
        });
    }

    private async initializeRenderers() {
        this.framebuffer?.cleanUp();
        this.framebuffer = new Framebuffer(this.gl);
        this.framebuffer.attachColorTexture(this.envCanvas.width, this.envCanvas.height, 0);

        this.imageData = this.context.createImageData(this.envCanvas.width, this.envCanvas.height, {
            colorSpace: "srgb",
        });
    }

    public async updateSettings(newSettings: Partial<Preview2dSettings>) {
        if (newSettings.viewportWidth && newSettings.viewportHeight) {
            this.envCanvas.width = newSettings.viewportWidth;
            this.envCanvas.height = newSettings.viewportHeight;
            await this.initializeRenderers();
        }

        if (newSettings.cameraProjection) {
            this.cameraProjection = newSettings.cameraProjection;
            glm.mat4.mul(this.cameraTransform, this.cameraProjection, this.cameraView);
        }

        if (newSettings.cameraView) {
            this.cameraView = newSettings.cameraView;
            glm.mat4.mul(this.cameraTransform, this.cameraProjection, this.cameraView);
        }
    }

    public render(material: MaterialSnapshot) {
        this.framebuffer.bind();

        this.gl.viewport(0, 0, this.envCanvas.width, this.envCanvas.height);
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        const baseColorOutputNode = Array.from(material.nodes.values()).find(
            (node) => node.node.path === "materializer/output",
        );
        if (baseColorOutputNode) {
            this.fullscreenShader.use((program) => {
                this.gl.activeTexture(this.gl.TEXTURE0);
                this.gl.bindTexture(
                    this.gl.TEXTURE_2D,
                    this.nodeRenderer.getNodeOutputTexture(baseColorOutputNode.node.id)!,
                );
                program.setUniformMatrix4("uTransformMatrix", false, this.cameraTransform);
                program.setUniformInt("uTexture", 0);
                program.setUniformBool("uFlipY", false);
                program.setUniformBool("uOutputSRGB", true);
                this.quadRenderer.render();
            });
        }

        this.gl.readBuffer(this.gl.COLOR_ATTACHMENT0);
        this.gl.readPixels(
            0,
            0,
            this.envCanvas.width,
            this.envCanvas.height,
            this.gl.RGBA,
            this.gl.UNSIGNED_BYTE,
            this.imageData.data,
        );

        this.framebuffer.unbind();

        this.context.putImageData(this.imageData, 0, 0);
    }
}

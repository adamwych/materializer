import * as glm from "gl-matrix";
import {
    Preview3dEnvironmentMap,
    Preview3dSettings,
    Preview3dShape,
    get3dPreviewEnvironmentMapUrl,
    get3dPreviewShapeGltf,
} from "../../preview-3d";
import { MaterialSnapshot } from "../../types";
import Framebuffer from "../framebuffer";
import WebGLNodeRenderer from "../node-renderer";
import WebGL3dPreviewPbrEnvironmentMap from "./environment-map";
import WebGL3dPreviewModel from "./model";
import WebGL3dPreviewPbrRenderPass from "./pbr-pass";
import WebGL3dPreviewSkyboxRenderPass from "./skybox-pass";

export default class WebGL3dPreviewRenderer {
    private readonly context: OffscreenCanvasRenderingContext2D;

    private model?: WebGL3dPreviewModel;
    private environmentMap?: WebGL3dPreviewPbrEnvironmentMap;

    private pbrRenderPass!: WebGL3dPreviewPbrRenderPass;
    private skyboxRenderPass!: WebGL3dPreviewSkyboxRenderPass;

    private multisampledFramebuffer!: Framebuffer;
    private destinationFramebuffer!: Framebuffer;

    private imageData!: ImageData;

    private cameraPosition = glm.vec3.create();
    private cameraProjection = glm.mat4.create();
    private cameraView = glm.mat4.create();
    private cameraTransform = glm.mat4.create();
    private usesMultisampling = true;

    constructor(
        private readonly envCanvas: OffscreenCanvas,
        private readonly gl: WebGL2RenderingContext,
        private readonly nodeRenderer: WebGLNodeRenderer,
    ) {
        this.context = envCanvas.getContext("2d")!;
    }

    public async initialize() {
        await this.updateSettings({
            viewportWidth: this.envCanvas.width,
            viewportHeight: this.envCanvas.height,
            shape: get3dPreviewShapeGltf(Preview3dShape.Sphere),
            environmentMapUrl: get3dPreviewEnvironmentMapUrl(
                Preview3dEnvironmentMap.LittleParisUnderTower,
            ),
        });
    }

    private async initializeRenderers() {
        this.multisampledFramebuffer?.cleanUp();
        this.destinationFramebuffer?.cleanUp();

        const maxSamples = this.gl.getParameter(this.gl.MAX_SAMPLES);
        if (this.usesMultisampling) {
            if (maxSamples === 0) {
                this.usesMultisampling = false;
            } else {
                this.multisampledFramebuffer = new Framebuffer(this.gl);
                this.multisampledFramebuffer.attachColorTexture(
                    this.envCanvas.width,
                    this.envCanvas.height,
                    maxSamples,
                );
                this.multisampledFramebuffer.attachDepthTexture(
                    this.envCanvas.width,
                    this.envCanvas.height,
                    maxSamples,
                );
            }
        }

        this.destinationFramebuffer = new Framebuffer(this.gl);
        this.destinationFramebuffer.attachColorTexture(
            this.envCanvas.width,
            this.envCanvas.height,
            0,
        );
        this.destinationFramebuffer.attachDepthTexture(
            this.envCanvas.width,
            this.envCanvas.height,
            0,
        );

        this.pbrRenderPass = new WebGL3dPreviewPbrRenderPass(
            this.gl,
            this.envCanvas.width,
            this.envCanvas.height,
            this.nodeRenderer,
        );

        this.skyboxRenderPass?.cleanUp();
        this.skyboxRenderPass = new WebGL3dPreviewSkyboxRenderPass(this.gl);

        this.imageData = this.context.createImageData(this.envCanvas.width, this.envCanvas.height, {
            colorSpace: "srgb",
        });
    }

    public async updateSettings(newSettings: Partial<Preview3dSettings>) {
        if (newSettings.viewportWidth && newSettings.viewportHeight) {
            this.envCanvas.width = newSettings.viewportWidth;
            this.envCanvas.height = newSettings.viewportHeight;
            await this.initializeRenderers();
        }

        if (newSettings.shape) {
            this.model?.cleanUp();
            this.model = await WebGL3dPreviewModel.fromGltf(this.gl, newSettings.shape);
        }

        if (newSettings.environmentMapUrl) {
            this.environmentMap?.cleanUp();
            this.environmentMap = await WebGL3dPreviewPbrEnvironmentMap.fromUrl(
                this.gl,
                newSettings.environmentMapUrl,
            );
        }

        if (newSettings.cameraProjection) {
            this.cameraProjection = newSettings.cameraProjection;
            glm.mat4.mul(this.cameraTransform, this.cameraProjection, this.cameraView);
        }

        if (newSettings.cameraView) {
            this.cameraView = newSettings.cameraView;
            glm.mat4.mul(this.cameraTransform, this.cameraProjection, this.cameraView);
        }

        if (newSettings.cameraPosition) {
            this.cameraPosition = newSettings.cameraPosition;
        }
    }

    public render(material: MaterialSnapshot) {
        if (this.usesMultisampling) {
            this.multisampledFramebuffer.bind();
        } else {
            this.destinationFramebuffer.bind();
        }

        this.pbrRenderPass.render(
            this.model!,
            material,
            this.cameraPosition,
            this.cameraTransform,
            this.environmentMap!,
        );
        this.skyboxRenderPass.render(
            this.environmentMap!.getPrefilterMapTexture(),
            this.cameraProjection,
            this.cameraView,
        );

        // Reading pixels directly from a renderbuffer is not possible, so
        // we must first blit it into a regular framebuffer.
        if (this.usesMultisampling) {
            this.multisampledFramebuffer.bindAsRead();
            this.destinationFramebuffer.bindAsDraw();

            this.gl.blitFramebuffer(
                0,
                0,
                this.envCanvas.width,
                this.envCanvas.height,
                0,
                0,
                this.envCanvas.width,
                this.envCanvas.height,
                this.gl.COLOR_BUFFER_BIT,
                this.gl.LINEAR,
            );

            this.destinationFramebuffer.bind();
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

        this.destinationFramebuffer.unbind();

        this.context.putImageData(this.imageData, 0, 0);
    }
}

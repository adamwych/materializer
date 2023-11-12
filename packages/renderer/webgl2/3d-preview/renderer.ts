import * as glm from "gl-matrix";
import sphereGltf from "../../../../resources/models/sphere.gltf?raw";
import { Preview3dSettings } from "../../preview-3d";
import { MaterialSnapshot } from "../../types";
import WebGLNodeRenderer from "../node-renderer";
import WebGL3dPreviewModel from "./model";
import WebGL3dPreviewPbrRenderPass from "./pbr-pass";
import WebGL3dPreviewFxRenderPass from "./postprocess-pass";

export default class WebGL3dPreviewRenderer {
    private readonly context: OffscreenCanvasRenderingContext2D;

    private pbrRenderPass!: WebGL3dPreviewPbrRenderPass;
    private fxRenderPass!: WebGL3dPreviewFxRenderPass;

    private pixelsData!: Uint8Array;

    private cameraPosition = glm.vec3.create();
    private cameraTransform = glm.mat4.create();

    constructor(
        private readonly envCanvas: OffscreenCanvas,
        private readonly gl: WebGL2RenderingContext,
        private readonly nodeRenderer: WebGLNodeRenderer,
    ) {
        this.context = envCanvas.getContext("2d")!;

        this.updateSettings({
            viewportWidth: envCanvas.width,
            viewportHeight: envCanvas.height,
            shape: JSON.parse(sphereGltf),
        });
    }

    private initializeRenderers() {
        const previousModel = this.pbrRenderPass?.getModel();
        this.pbrRenderPass?.cleanUp();
        this.pbrRenderPass = new WebGL3dPreviewPbrRenderPass(
            this.gl,
            this.envCanvas.width,
            this.envCanvas.height,
            this.nodeRenderer,
        );
        if (previousModel) {
            this.pbrRenderPass.setModel(previousModel);
        }

        this.fxRenderPass?.cleanUp();
        this.fxRenderPass = new WebGL3dPreviewFxRenderPass(
            this.gl,
            this.envCanvas.width,
            this.envCanvas.height,
        );

        this.pixelsData = new Uint8Array(this.envCanvas.width * this.envCanvas.height * 4);
    }

    public async updateSettings(newSettings: Partial<Preview3dSettings>) {
        if (newSettings.viewportWidth && newSettings.viewportHeight) {
            this.envCanvas.width = newSettings.viewportWidth;
            this.envCanvas.height = newSettings.viewportHeight;
            this.initializeRenderers();
        }

        if (newSettings.shape) {
            this.pbrRenderPass.setModel(
                await WebGL3dPreviewModel.fromGltf(this.gl, newSettings.shape),
            );
        }

        if (newSettings.cameraTransform) {
            this.cameraTransform = newSettings.cameraTransform;
        }

        if (newSettings.cameraPosition) {
            this.cameraPosition = newSettings.cameraPosition;
        }
    }

    public render(material: MaterialSnapshot) {
        this.pbrRenderPass.render(material, this.cameraPosition, this.cameraTransform);
        this.fxRenderPass.render(this.pbrRenderPass.getColorTexture()!, this.pixelsData);

        this.context.putImageData(
            new ImageData(
                new Uint8ClampedArray(this.pixelsData),
                this.envCanvas.width,
                this.envCanvas.height,
            ),
            0,
            0,
        );
    }
}

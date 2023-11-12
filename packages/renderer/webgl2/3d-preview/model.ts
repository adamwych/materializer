import { GLTF, WebIO } from "@gltf-transform/core";

export default class WebGL3dPreviewModel {
    constructor(
        private readonly gl: WebGL2RenderingContext,
        private readonly attributeBuffers: Array<WebGLBuffer>,
        private readonly indexBuffer: WebGLBuffer,
        private readonly vao: WebGLVertexArrayObject,
        private readonly vertexCount: number,
    ) {}

    public cleanUp() {
        this.gl.deleteBuffer(this.indexBuffer);
        this.gl.deleteVertexArray(this.vao);
        this.attributeBuffers.forEach((b) => this.gl.deleteBuffer(b));
    }

    public getNumberOfVertices() {
        return this.vertexCount;
    }

    public getIndexBuffer() {
        return this.indexBuffer;
    }

    public getVertexArrayObject() {
        return this.vao;
    }

    public static async fromGltf(gl: WebGL2RenderingContext, gltf: GLTF.IGLTF) {
        const document = await new WebIO().readJSON({
            json: gltf,
            resources: {},
        });

        const mesh = document.getRoot().listMeshes()[0];
        const primitive = mesh.listPrimitives()[0];

        const vao = gl.createVertexArray()!;
        gl.bindVertexArray(vao);

        const attributeBuffers = primitive.listAttributes().map((attribute, index) => {
            const stride = attribute.getComponentSize() * attribute.getElementSize();
            const buffer = gl.createBuffer()!;
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, attribute.getArray()!, gl.STATIC_DRAW);
            gl.vertexAttribPointer(
                index,
                attribute.getElementSize(),
                attribute.getComponentType(),
                false,
                stride,
                0,
            );
            gl.enableVertexAttribArray(index);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            return buffer;
        });

        const indexBuffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, primitive.getIndices()!.getArray(), gl.STATIC_DRAW);

        return new WebGL3dPreviewModel(
            gl,
            attributeBuffers,
            indexBuffer,
            vao,
            primitive.getIndices()!.getCount(),
        );
    }
}

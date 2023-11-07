export type MaterialNodePainterType = "glsl" | "tile" | "scatter";

export type GlslPainterInfo = {
    type: "glsl";
    fragmentShader: string;
};

export type TilePainterInfo = {
    type: "tile";
};

export type ScatterPainterInfo = {
    type: "scatter";
};

/**
 * Describes the painter that should be used to render a specific node.
 * Painters directly interface the rendering engine and queue draw calls.
 */
export type MaterialNodePainterInfo = GlslPainterInfo | TilePainterInfo | ScatterPainterInfo;

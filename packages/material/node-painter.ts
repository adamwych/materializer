export type MaterialNodePainterType = "glsl" | "glsl-two-pass" | "tile" | "scatter";

export type GlslPainterInfo = {
    type: "glsl";
    fragmentShader: string;
};

export type TwoPassGlslPainterInfo = {
    type: "glsl-two-pass";
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
export type MaterialNodePainterInfo =
    | GlslPainterInfo
    | TwoPassGlslPainterInfo
    | TilePainterInfo
    | ScatterPainterInfo;

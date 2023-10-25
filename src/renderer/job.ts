import { DeepReadonly } from "ts-essentials";
import {
    Material,
    MaterialNode,
    MaterialNodeRuntimeInfo,
} from "../types/material.ts";
import { RenderJobResult } from "./job-result.ts";
import { MaterialNodeOutputBitmap } from "./output.ts";

export type NodeRenderJobInfo = {
    type: "node";
    material: DeepReadonly<Material>;
    node: DeepReadonly<MaterialNode>;
    info: DeepReadonly<MaterialNodeRuntimeInfo>;
    result: NodeRenderJobResult;
};
export type NodeRenderJobResult = RenderJobResult<
    Map<string, MaterialNodeOutputBitmap>
>;

export type PreviewRenderJobInfo = {
    type: "preview";
    material: DeepReadonly<Material>;
    result: PreviewRenderJobResult;
};
export type PreviewRenderJobResult = RenderJobResult<ImageBitmap>;

/**
 * Describes a render job scheduled by the {@link RenderingScheduler}.
 */
export type RenderJobInfo = NodeRenderJobInfo | PreviewRenderJobInfo;

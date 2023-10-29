export enum MaterialNodeOutputTarget {
    Albedo = "albedo",
    Height = "height",
}

/**
 * Describes a parameter that can be passed to a {@link MaterialNode}.
 * This does not hold the actual value of that parameter, it only describes
 * its characteristics. To get the value refer to {@link MaterialNode#parameters} map.
 */
export type MaterialNodeParameterInfo = {
    id: string;
    label: string;
    type: string;
    default: unknown;
    valueType: string;
    min?: number;
    max?: number;
    options?: Array<{ label: string; value: any }>;
    when?: string;
};

/**
 * Describes an input or output socket of a {@link MaterialNode}.
 */
export type MaterialNodeSocketInfo = {
    id: string;
};

export type MaterialNodeSocketAddr = {
    nodeId: number;
    socketId: string;
};

export type MaterialNodeParametersMap = { [k: string]: unknown };

export type MaterialNode = {
    readonly id: number;
    readonly path: string;
    spec?: MaterialNodeSpec;
    label: string;
    x: number;
    y: number;
    zIndex: number;
    parameters: MaterialNodeParametersMap;
};

export type Material = {
    name: string;
    textureWidth: number;
    textureHeight: number;
    nodes: Array<MaterialNode>;
    connections: Array<{
        from: MaterialNodeSocketAddr;
        to: MaterialNodeSocketAddr;
    }>;
};

export type MaterialNodePainterInfo =
    | {
          type: "glsl";
          glsl: string;
      }
    | {
          type: "scatter";
      };

/**
 * Describes a material node of specific kind.
 */
export type MaterialNodeSpec = {
    /** Human-readable name of this node kind. */
    name: string;

    /** List of user-editable parameters that this node accepts. */
    parameters: Array<MaterialNodeParameterInfo>;

    /** Inputs that this node accepts. */
    inputSockets: Array<MaterialNodeSocketInfo>;

    /** Outputs that this node exposes. */
    outputSockets: Array<MaterialNodeSocketInfo>;

    /** Painter to use to draw this node. */
    painter: MaterialNodePainterInfo;
};

export type MaterialNodesPackage = {
    nodes: Map<string, MaterialNodeSpec>;
};

export function isOutputNodePath(path: string) {
    return path === "@materializer/output";
}

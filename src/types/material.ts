export enum MaterialNodeOutputTarget {
    Albedo = "albedo",
    Normal = "normal",
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

/**
 * Describes a material node of specific kind.
 */
export type MaterialNodeSpec = {
    name: string;
    parameters: Array<MaterialNodeParameterInfo>;
    inputSockets: Array<MaterialNodeSocketInfo>;
    outputSockets: Array<MaterialNodeSocketInfo>;
    glsl: string;
};

export type MaterialNodesPackage = {
    nodes: Map<string, MaterialNodeSpec>;
};

export function isOutputNodePath(path: string) {
    return path === "@materializer/output";
}

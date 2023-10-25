export enum MaterialNodeType {
    SolidColor = 0,
    Blend = 1,
    Noise = 2,
    Output = 3,
}

export enum MaterialNodeOutputTarget {
    Albedo = "albedo",
    Normal = "normal",
}

/**
 * Stores information about a node that can only be evaluated during runtime.
 */
export type MaterialNodeRuntimeInfo = {
    parameters: Array<MaterialNodeParameterInfo>;
    inputSockets: Array<MaterialNodeSocketInfo>;
    outputSockets: Array<MaterialNodeSocketInfo>;
    element?: HTMLElement;
};

/**
 * Describes a parameter that can be passed to a {@link MaterialNode}.
 * This does not hold the actual value of that parameter, it only describes
 * its characteristics. To get the value refer to {@link MaterialNode#parameters} map.
 */
export type MaterialNodeParameterInfo = {
    id: string;
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
    readonly type: MaterialNodeType;
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

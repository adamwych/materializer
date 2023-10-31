import TextureFilterMethod from "./texture-filter";

export enum MaterialNodeOutputTarget {
    Albedo = "albedo",
    Height = "height",
}

export type MaterialNodeParameterType = "rgb" | "number" | "select";

/**
 * Describes a parameter that can be passed to a {@link MaterialNode}.
 * This does not hold the actual value of that parameter, it only describes
 * its characteristics. To get the value refer to {@link MaterialNode#parameters} map.
 */
export type MaterialNodeParameterInfo = {
    id: string;
    label: string;
    type: MaterialNodeParameterType;
    default: unknown;
    valueType: string;
    min?: number;
    max?: number;
    step?: number;
    options?: Array<{ label: string; value: unknown }>;
    when?: string;
};

/**
 * Describes an input or output socket of a {@link MaterialNode}.
 */
export type MaterialNodeSocketInfo = {
    id: string;

    /** Whether this socket should be visible in the UI. */
    hidden?: boolean;
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
    id: string;
    name: string;
    textureWidth: number;
    textureHeight: number;
    textureFiltering: TextureFilterMethod;
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
      }
    | {
          type: "tile";
      };

/**
 * Describes a material node of specific kind.
 */
export type MaterialNodeSpec = {
    /** Human-readable name of this node kind. */
    name: string;

    /** Name of the group to put this node in. */
    groupName: string;

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

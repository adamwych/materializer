import { MaterialNodePainterInfo } from "./node-painter";
import { MaterialNodeParameterInfo } from "./node-parameter";
import { MaterialNodeSocketInfo } from "./node-socket";

export type MaterialNode = {
    /** An incremental number uniquely identifying this node among others *in its material*. */
    id: number;

    /** A user-assignable label that describes this node's purpose. */
    name: string;

    /** Specifies what blueprint to use when rendering this node. */
    path: string;

    /** Position of this node on the X axis. */
    x: number;

    /** Position of this node on the Y axis. */
    y: number;

    /**
     * These parameters are simply passed to the painter specified in
     * node's blueprint - how they are used depends on the painter.
     */
    parameters: Record<string, unknown>;

    textureSize: number;
};

/**
 * A material node blueprint collects details about a certain kind
 * of node for later use by the rendering engine and the UI.
 *
 * Blueprints are re-usable and can be associated with multiple nodes,
 * so they do not contain details about any specific node instance,
 * but rather a general description of that node.
 */
export type MaterialNodeBlueprint = {
    /**
     * A string uniquely identifying this blueprint among others.
     * IDs must be unique within a nodes package.
     */
    id: string;

    /**
     * Human-readable name of this blueprint.
     * This will be used as the default name for a node
     * instantiated using this blueprint.
     */
    name: string;

    /**
     * Name of the group into which this blueprint should be put when
     * showing it in the UI. Blueprints with identical `groupName`
     * values are shown next to each other.
     */
    groupName: string;

    /** List of parameters, that the node accepts. */
    parameters: Record<string, MaterialNodeParameterInfo>;

    /** List of inputs, that this node accepts. */
    inputs: Record<string, MaterialNodeSocketInfo>;

    /** List of outputs, that this node exposes. */
    outputs: Record<string, MaterialNodeSocketInfo>;

    /** Details about the painter that can render this node. */
    painter: MaterialNodePainterInfo;

    preferredTextureSize: number;
};

export type MaterialNodeBlueprintsPackage = Map<string, MaterialNodeBlueprint>;
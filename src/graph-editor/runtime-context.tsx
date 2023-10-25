import {
    Accessor,
    createContext,
    createSignal,
    JSX,
    useContext,
} from "solid-js";
import {
    MaterialNode,
    MaterialNodeParametersMap,
    MaterialNodeRuntimeInfo,
} from "../types/material.ts";
import { DeepReadonly } from "ts-essentials";
import { BuiltinNodeSpec, getBuiltinNodeSpec } from "../nodes";
import { unwrap } from "solid-js/store";
import RenderingScheduler from "../renderer/scheduler.ts";
import { MaterialNodeOutputBitmap } from "../renderer/output.ts";
import RenderingEngine from "../renderer/engine.ts";
import { ReactiveMap } from "@solid-primitives/map";
import { useEditorMaterialContext } from "./material-context.ts";
import { useAppContext } from "../app-context.ts";

export interface IEditorRuntimeContext {
    instantiateNode(spec: BuiltinNodeSpec, x: number, y: number): void;

    /**
     * Figures out what input and output sockets given node has and stores
     * that information for later use. This method needs to be called for each
     * new node.
     *
     * @param node
     */
    analyzeNode(node: MaterialNode): void;

    updateNodeBoxElement(nodeId: number, element: HTMLElement): void;

    getNodeSocketElement(nodeId: number, socketId: string): HTMLElement | null;

    /**
     * Returns the {@link MaterialNodeRuntimeInfo} associated with given node, or
     * undefined if the node has not been analyzed yet.
     * @param nodeId
     */
    getNodeInfo(nodeId: number): Accessor<MaterialNodeRuntimeInfo | undefined>;

    scheduleNodeRender(node: MaterialNode): Promise<void>;

    schedulePreviewRender(): void;

    getPreviewOutputTexture(): Accessor<ImageBitmap | undefined>;

    getNodeOutputTextures(
        nodeId: number,
    ): Accessor<ReadonlyMap<string, MaterialNodeOutputBitmap>>;

    setHighlightedNodes(ids: Array<number>): void;

    isNodeHighlighted(id: number): boolean;

    clearHighlight(): void;

    inspectNode(id?: number): void;

    /**
     * Returns ID of node currently being inspected by the user or
     * undefined if no node is under inspection.
     */
    getInspectedNode(): Accessor<DeepReadonly<MaterialNode> | undefined>;

    getRenderingEngine(): RenderingEngine;
}

const EditorRuntimeContext = createContext<IEditorRuntimeContext>(
    undefined as unknown as IEditorRuntimeContext,
);

export function EditorRuntimeContextProvider(props: { children: JSX.Element }) {
    const appCtx = useAppContext()!;
    const materialCtx = useEditorMaterialContext()!;
    const renderEngine = new RenderingEngine(
        materialCtx.getOutputTextureWidth(),
        materialCtx.getOutputTextureHeight(),
    );
    const scheduler = new RenderingScheduler(renderEngine);
    const [highlightedNodes, setHighlightedNodes] = createSignal<Array<number>>(
        [],
    );
    const [inspectedNodeId, setInspectedNodeId] = createSignal<number>();
    const runtimeInfos = new ReactiveMap<number, MaterialNodeRuntimeInfo>();
    const outputTextures = new ReactiveMap<
        number,
        Map<string, MaterialNodeOutputBitmap>
    >();
    const [previewOutputTexture, setPreviewOutputTexture] =
        createSignal<ImageBitmap>();

    const context: IEditorRuntimeContext = {
        instantiateNode(spec, x, y) {
            const id = Math.max(...materialCtx.getNodes().map((x) => x.id)) + 1;
            const parameters: MaterialNodeParametersMap = {};
            spec.parameters.forEach((parameter) => {
                parameters[parameter.id] = parameter.default;
            });
            const node: MaterialNode = {
                id,
                type: spec.type,
                parameters,
                x,
                y,
                label: spec.name,
                zIndex: id,
            };

            this.analyzeNode(node);
            materialCtx.addNode(node);
            this.scheduleNodeRender(node);
        },

        analyzeNode(node) {
            const spec = getBuiltinNodeSpec(node.type);
            runtimeInfos.set(node.id, {
                parameters: spec.parameters,
                inputSockets: spec.inputSockets,
                outputSockets: spec.outputSockets,
            });
        },

        updateNodeBoxElement(nodeId, element) {
            runtimeInfos.set(nodeId, {
                ...runtimeInfos.get(nodeId)!,
                element,
            });
        },

        getNodeSocketElement(
            nodeId: number,
            socketId: string,
        ): HTMLElement | null {
            const nodeInfo = runtimeInfos.get(nodeId);
            const nodeElement = nodeInfo?.element;
            if (!nodeElement) {
                return null;
            }
            return nodeElement.querySelector(`[data-socket=${socketId}`);
        },

        getNodeInfo(nodeId): Accessor<MaterialNodeRuntimeInfo> {
            return () => runtimeInfos.get(nodeId)!;
        },

        async scheduleNodeRender(node) {
            const runtimeInfo = this.getNodeInfo(node.id)();
            if (!runtimeInfo) {
                throw new Error(
                    "Node must be analyzed before it can be rendered.",
                );
            }

            const material = materialCtx.getMaterial();
            const results = scheduler.scheduleChain(
                unwrap(material()),
                unwrap(node),
                (id) => unwrap(materialCtx.getNodeById(id)!),
                (id) => unwrap(this.getNodeInfo(id)()!),
            );

            for (const result of results) {
                if (result.type === "node") {
                    result.then((outputs) => {
                        outputTextures.set(
                            result.nodeId!,
                            outputs as Map<string, MaterialNodeOutputBitmap>,
                        );
                    });
                } else if (result.type === "preview") {
                    result.then((bitmap) => {
                        setPreviewOutputTexture(bitmap as ImageBitmap);
                    });
                }
            }
        },

        schedulePreviewRender() {
            const material = materialCtx.getMaterial();
            const result = scheduler.schedulePreviewUpdate(unwrap(material()));
            result.then((bitmap) => {
                setPreviewOutputTexture(bitmap as ImageBitmap);
            });
        },

        getNodeOutputTextures(
            nodeId,
        ): Accessor<ReadonlyMap<string, MaterialNodeOutputBitmap>> {
            return () =>
                outputTextures.get(nodeId) ??
                new Map<string, MaterialNodeOutputBitmap>();
        },

        getPreviewOutputTexture(): Accessor<ImageBitmap | undefined> {
            return previewOutputTexture;
        },

        setHighlightedNodes(ids) {
            setHighlightedNodes(ids);
        },

        isNodeHighlighted(id) {
            return highlightedNodes().includes(id);
        },

        clearHighlight() {
            setHighlightedNodes([]);
        },

        inspectNode(id?) {
            setInspectedNodeId(id);
        },

        getInspectedNode(): Accessor<MaterialNode | undefined> {
            return () => materialCtx.getNodeById(inspectedNodeId()!);
        },

        getRenderingEngine(): RenderingEngine {
            return renderEngine;
        },
    };

    // *All* nodes must be analyzed before *any* node is rendered.
    materialCtx.getNodes().forEach((node) => {
        context.analyzeNode(node);
    });

    materialCtx.getNodes().forEach((node) => {
        context.scheduleNodeRender(node);
    });

    scheduler.run();

    appCtx.registerRuntimeContext(materialCtx.getMaterial()(), context);

    return (
        <EditorRuntimeContext.Provider value={context}>
            {props.children}
        </EditorRuntimeContext.Provider>
    );
}

export function useEditorRuntimeContext(): IEditorRuntimeContext {
    return useContext<IEditorRuntimeContext>(EditorRuntimeContext);
}

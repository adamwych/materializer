import { For } from "solid-js";
import { useNodeBlueprintsStore } from "../../../stores/blueprints";
import { MaterialNode } from "../../../types/node";
import cn from "../../../utils/cn";
import { EDITOR_NODE_HEIGHT, EDITOR_NODE_WIDTH } from "../consts";
import { useEditorRuntimeCache } from "./cache";
import { useEditorInteractionManager } from "./interaction/manager";
import { useEditorSelectionManager } from "./interaction/selection";
import EditorCanvasNodeSocket from "./node-socket";

type Props = {
    node: MaterialNode;
};

export default function EditorCanvasNodeBox(props: Props) {
    const runtimeCache = useEditorRuntimeCache()!;
    const interactionManager = useEditorInteractionManager()!;
    const selectionManager = useEditorSelectionManager()!;
    const packagesRegistry = useNodeBlueprintsStore()!;
    const spec = () => packagesRegistry.getBlueprintByPath(props.node.path);
    const isHighlighted = () => selectionManager.selectedNodes().includes(props.node.id);

    return (
        <div
            ref={(e) => runtimeCache.setNodeDOMElement(props.node.id, e)}
            class={cn(
                "absolute group pointer-events-auto",
                "rounded-md",
                isHighlighted()
                    ? "outline outline-blue-500 active:outline-gray-300"
                    : "outline outline-gray-100 hover:outline-gray-300 active:outline-gray-200",
                "animate-fade-scale-in",
            )}
            style={{
                width: EDITOR_NODE_WIDTH + "px",
                height: EDITOR_NODE_HEIGHT + "px",
                top: props.node.y + "px",
                left: props.node.x + "px",
                transition: "outline-color 70ms",
            }}
            onPointerDown={(ev) => interactionManager.onPointerDownOnNode(ev, props.node.id)}
        >
            <div class="relative w-full h-full flex flex-col">
                <div
                    class={cn(
                        "p-2 text-center font-semibold",
                        !isHighlighted() && "bg-opacity-50 bg-black group-hover:bg-transparent",
                        "rounded-t-md",
                    )}
                    style={{
                        transition: "all 70ms",
                    }}
                >
                    <div class="whitespace-nowrap text-ellipsis overflow-hidden">
                        {props.node.name}
                    </div>
                </div>

                <div class="flex justify-between h-full">
                    <div class="flex flex-col justify-center gap-2">
                        <For each={Object.values(spec()!.inputs).filter((x) => !x.hidden)}>
                            {(socketInfo) => (
                                <EditorCanvasNodeSocket
                                    nodeId={props.node.id}
                                    socket={socketInfo}
                                    alignment="left"
                                />
                            )}
                        </For>
                    </div>
                    <div class="flex flex-col justify-center gap-2">
                        <For each={Object.values(spec()!.outputs).filter((x) => !x.hidden)}>
                            {(socketInfo) => (
                                <EditorCanvasNodeSocket
                                    nodeId={props.node.id}
                                    socket={socketInfo}
                                    alignment="right"
                                />
                            )}
                        </For>
                    </div>
                </div>
            </div>
        </div>
    );
}

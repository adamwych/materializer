import { MaterialNode } from "../types/material.ts";
import { DeepReadonly } from "ts-essentials";
import { Accessor, For, Show } from "solid-js";
import MaterialNodeSocketBox from "./node-socket.tsx";
import { useEditorRuntimeContext } from "./runtime-context.tsx";
import MaterialNodeBoxImage from "./node-output-image.tsx";
import { useConnectionBuilder } from "./connection-builder.tsx";
import { useEditorSelectionManager } from "./selection/manager.ts";

interface Props {
    node: Accessor<MaterialNode>;
}

export default function MaterialNodeBox(props: DeepReadonly<Props>) {
    const editorCtx = useEditorRuntimeContext();
    const selectionManager = useEditorSelectionManager()!;
    const connectionBuilder = useConnectionBuilder();
    const outputTextures = () => {
        const textures = editorCtx.getNodeOutputTextures(props.node().id);
        return Array.from(textures()?.values() ?? []);
    };
    const runtimeInfo = editorCtx.getNodeInfo(props.node().id);
    const inspectedNode = editorCtx.getInspectedNode();
    const isHighlighted = () =>
        connectionBuilder.isBuildingConnectionFrom(props.node().id) ||
        inspectedNode()?.id === props.node().id ||
        editorCtx.isNodeHighlighted(props.node().id);
    const size = 144;

    return (
        <div
            ref={(e) => editorCtx.updateNodeBoxElement(props.node().id, e)}
            class={`group absolute bg-gray-200-0 rounded-md outline ${
                isHighlighted()
                    ? "outline-gray-500-0 active:outline-gray-300-0"
                    : "outline-transparent hover:outline-gray-300-0"
            }`}
            style={{
                transition: "outline-color 70ms",
                width: size + "px",
                height: size + "px",
                top: props.node().y + "px",
                left: props.node().x + "px",
                "z-index": props.node().zIndex,
            }}
            onMouseDown={(ev) =>
                selectionManager.onNodeMouseDown(ev, props.node().id)
            }
        >
            <For each={outputTextures()}>
                {(bitmap, index) => (
                    <MaterialNodeBoxImage
                        index={index() - outputTextures().length / 2 + 0.5}
                        stacked={outputTextures().length > 1}
                        size={size}
                        bitmap={bitmap}
                    />
                )}
            </For>

            <div class="relative z-10 w-full h-full flex flex-col">
                <div
                    class={`backdrop-blur group-hover:backdrop-blur-0 bg-opacity-50 bg-black-0 p-2 text-center font-semibold group-hover:bg-transparent rounded-t-md ${
                        isHighlighted() ? "bg-transparent" : ""
                    }`}
                    style={{
                        transition: "all 70ms, backdrop-filter 0ms",
                    }}
                >
                    {props.node().label}
                </div>

                <Show when={runtimeInfo()}>
                    <div class="flex justify-between h-full">
                        <div class="flex flex-col justify-center gap-2">
                            <For each={runtimeInfo()!.inputSockets}>
                                {(socket) => (
                                    <MaterialNodeSocketBox
                                        id={socket.id}
                                        alignment="left"
                                        socket={socket}
                                        onMouseDown={(ev) =>
                                            connectionBuilder.onSocketMouseDown(
                                                ev,
                                                props.node().id,
                                                socket.id,
                                            )
                                        }
                                        onMouseUp={(ev) =>
                                            connectionBuilder.onSocketMouseUp(
                                                ev,
                                                props.node().id,
                                                socket.id,
                                            )
                                        }
                                    />
                                )}
                            </For>
                        </div>
                        <div class="flex flex-col justify-center gap-2">
                            <For each={runtimeInfo()!.outputSockets}>
                                {(socket) => (
                                    <MaterialNodeSocketBox
                                        id={socket.id}
                                        alignment="right"
                                        socket={socket}
                                        onMouseDown={(ev) =>
                                            connectionBuilder.onSocketMouseDown(
                                                ev,
                                                props.node().id,
                                                socket.id,
                                            )
                                        }
                                        onMouseUp={(ev) =>
                                            connectionBuilder.onSocketMouseUp(
                                                ev,
                                                props.node().id,
                                                socket.id,
                                            )
                                        }
                                    />
                                )}
                            </For>
                        </div>
                    </div>
                </Show>
            </div>
        </div>
    );
}

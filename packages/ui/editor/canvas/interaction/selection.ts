import { createContextProvider } from "@solid-primitives/context";
import { createSignal } from "solid-js";
import makeDragListener from "../../../../utils/makeDragListener";
import { useEditorRuntimeCache } from "../cache";
import { useMaterialStore } from "../../../../stores/material";
import { useEditorCameraState } from "./camera";

export const [EditorSelectionManager, useEditorSelectionManager] = createContextProvider(() => {
    const runtimeCache = useEditorRuntimeCache()!;
    const materialActions = useMaterialStore()!;
    const cameraState = useEditorCameraState()!;
    const [multiselectRect, setMultiselectRect] = createSignal<DOMRect | undefined>();
    const [selectedNodes, setSelectedNodes] = createSignal<Array<number>>([]);

    return {
        beginCanvasInteraction(downEvent: PointerEvent) {
            makeDragListener(
                (moveEvent) => {
                    const rect = new DOMRect(
                        moveEvent.pageX < downEvent.pageX ? moveEvent.pageX : downEvent.pageX,
                        moveEvent.pageY < downEvent.pageY ? moveEvent.pageY : downEvent.pageY,
                        Math.abs(moveEvent.pageX - downEvent.pageX),
                        Math.abs(moveEvent.pageY - downEvent.pageY),
                    );

                    setSelectedNodes(runtimeCache.getNodesWithinRect(rect).map((x) => x.id));
                    setMultiselectRect(rect);
                },
                () => {
                    if (!multiselectRect()) {
                        setSelectedNodes([]);
                    }

                    setMultiselectRect(undefined);
                },
            );
        },

        beginNodeInteraction(_: PointerEvent, nodeId: number) {
            let didMove = false;
            makeDragListener(
                (ev) => {
                    didMove = true;

                    const nodesToMove = selectedNodes().includes(nodeId)
                        ? selectedNodes()
                        : [nodeId];
                    nodesToMove.forEach((nodeId) => {
                        materialActions.moveNode(
                            nodeId,
                            ev.movementX / cameraState.smoothScale(),
                            ev.movementY / cameraState.smoothScale(),
                        );
                    });
                },
                () => {
                    if (!didMove) {
                        setSelectedNodes([nodeId]);
                    }
                },
            );
        },

        clear() {
            setSelectedNodes([]);
        },

        multiselectRect,
        selectedNodes,
    };
});

export type IEditorSelectionManager = NonNullable<ReturnType<typeof useEditorSelectionManager>>;

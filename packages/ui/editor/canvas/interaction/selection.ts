import { createContextProvider } from "@solid-primitives/context";
import { createSignal } from "solid-js";
import { useMaterialStore } from "../../../../stores/material";
import makeDragListener from "../../../../utils/makeDragListener";
import { EDITOR_GRID_SIZE } from "../../consts";
import { useEditorRuntimeCache } from "../cache";
import { useEditorCameraState } from "./camera";

export const [EditorSelectionManager, useEditorSelectionManager] = createContextProvider(() => {
    const runtimeCache = useEditorRuntimeCache()!;
    const materialActions = useMaterialStore()!;
    const cameraState = useEditorCameraState()!;
    const [multiselectRect, setMultiselectRect] = createSignal<DOMRect | undefined>();
    const [selectedNodes, setSelectedNodes] = createSignal<Array<number>>([]);
    const [snapToGrid, setSnapToGrid] = createSignal(true);

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
            let accumulatedMovementX = 0;
            let accumulatedMovementY = 0;

            const nodesToMove = (selectedNodes().includes(nodeId) ? selectedNodes() : [nodeId])
                .map((id) => materialActions.getNodeById(id)!)
                .map((node) => ({
                    node,
                    startX: node.x,
                    startY: node.y,
                }));

            makeDragListener(
                (ev) => {
                    didMove = true;
                    accumulatedMovementX += ev.movementX;
                    accumulatedMovementY += ev.movementY;

                    for (const info of nodesToMove) {
                        let newX = info.startX + accumulatedMovementX / cameraState.smoothScale();
                        let newY = info.startY + accumulatedMovementY / cameraState.smoothScale();

                        if (snapToGrid()) {
                            newX = Math.round(newX / EDITOR_GRID_SIZE) * EDITOR_GRID_SIZE;
                            newY = Math.round(newY / EDITOR_GRID_SIZE) * EDITOR_GRID_SIZE;
                        }

                        materialActions.moveNodeTo(info.node.id, newX, newY);
                    }
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
        setSelectedNodes,

        snapToGrid,
        setSnapToGrid,
    };
});

export type IEditorSelectionManager = NonNullable<ReturnType<typeof useEditorSelectionManager>>;

import { createContext, createSignal, JSX, Show, useContext } from "solid-js";
import UIMaterialGraphNodeConnectionCurve from "./connection-curve.tsx";
import { useEditorRuntimeContext } from "./runtime-context.tsx";
import { MaterialNodeSocketAddr } from "../types/material.ts";
import { useEditorSelectionManager } from "./selection/manager.ts";
import { useEditorMaterialContext } from "./material-context.ts";

type UpcomingConnectionInfo = {
    from: MaterialNodeSocketAddr;
    fromCoords: [number, number];
    toCoords: [number, number];
};

export interface IConnectionBuilder {
    onSocketMouseDown(ev: MouseEvent, nodeId: number, socketId: string): void;

    onSocketMouseUp(ev: MouseEvent, nodeId: number, socketId: string): void;

    isBuildingConnectionFrom(nodeId: number): boolean;
}

const ConnectionBuilder = createContext<IConnectionBuilder>(
    undefined as unknown as IConnectionBuilder,
);

export function ConnectionBuilderProvider(props: { children: JSX.Element }) {
    const editorCtx = useEditorRuntimeContext();
    const materialCtx = useEditorMaterialContext()!;
    const selectionManager = useEditorSelectionManager()!;
    const [upcomingInfo, setUpcomingInfo] = createSignal<
        UpcomingConnectionInfo | undefined
    >();

    function onWindowMouseMove(ev: MouseEvent) {
        setUpcomingInfo((value) => ({
            ...value!,
            toCoords: [ev.pageX, ev.pageY],
        }));
    }

    function onWindowMouseUp(_ev: MouseEvent) {
        window.removeEventListener("mouseup", onWindowMouseUp);
        window.removeEventListener("mousemove", onWindowMouseMove);
        setUpcomingInfo(undefined);
    }

    const context: IConnectionBuilder = {
        onSocketMouseDown(ev, nodeId, socketId) {
            ev.stopPropagation();

            const element = editorCtx.getNodeSocketElement(nodeId, socketId);
            const boundingBox = element!.getBoundingClientRect();

            selectionManager.deselectAll();

            setUpcomingInfo({
                from: {
                    nodeId,
                    socketId,
                },
                fromCoords: [boundingBox.x + 8, boundingBox.y + 8],
                toCoords: [boundingBox.x + 8, boundingBox.y + 8],
            });

            window.addEventListener("mouseup", onWindowMouseUp);
            window.addEventListener("mousemove", onWindowMouseMove);
        },

        onSocketMouseUp(ev, nodeId, socketId) {
            ev.stopPropagation();
            window.removeEventListener("mouseup", onWindowMouseUp);
            window.removeEventListener("mousemove", onWindowMouseMove);

            const upcoming = upcomingInfo();
            if (!upcoming) {
                return;
            }

            const nodeInfo = editorCtx.getNodeInfo(nodeId)()!;
            const isInputSocket = nodeInfo.inputSockets.some(
                (x) => x.id === socketId,
            );

            if (!isInputSocket || upcoming.from.nodeId === nodeId) {
                setUpcomingInfo(undefined);
                return;
            }

            materialCtx.addConnection(upcoming.from, {
                nodeId,
                socketId,
            });

            setUpcomingInfo(undefined);
            editorCtx.scheduleNodeRender(materialCtx.getNodeById(nodeId)!);
        },

        isBuildingConnectionFrom(nodeId): boolean {
            return upcomingInfo()?.from.nodeId === nodeId;
        },
    };

    return (
        <ConnectionBuilder.Provider value={context}>
            <Show when={upcomingInfo()}>
                <UIMaterialGraphNodeConnectionCurve
                    fromCoords={upcomingInfo()!.fromCoords}
                    toCoords={upcomingInfo()!.toCoords}
                />
            </Show>

            {props.children}
        </ConnectionBuilder.Provider>
    );
}

export function useConnectionBuilder(): IConnectionBuilder {
    return useContext<IConnectionBuilder>(ConnectionBuilder);
}

import { createContext, createSignal, JSX, Show, useContext } from "solid-js";
import MaterialGraphNodeConnectionCurve from "./connection-curve.tsx";
import { useEditorContext } from "./editor-context.ts";
import { MaterialNodeSocketAddr } from "../types/material.ts";
import { useEditorSelectionManager } from "./selection/manager.ts";
import { useMaterialContext } from "./material-context.ts";

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

export function EditorConnectionBuilderProvider(props: { children: JSX.Element }) {
    const editorCtx = useEditorContext()!;
    const materialCtx = useMaterialContext()!;
    const selectionManager = useEditorSelectionManager()!;
    const [upcomingInfo, setUpcomingInfo] = createSignal<UpcomingConnectionInfo | undefined>();

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

            const isInputSocket = materialCtx
                .getNodeById(nodeId)!
                .spec!.inputSockets.some((x) => x.id === socketId);

            if (!isInputSocket || upcoming.from.nodeId === nodeId) {
                setUpcomingInfo(undefined);
                return;
            }

            materialCtx.addSocketConnection(upcoming.from, {
                nodeId,
                socketId,
            });

            setUpcomingInfo(undefined);
        },

        isBuildingConnectionFrom(nodeId): boolean {
            return upcomingInfo()?.from.nodeId === nodeId;
        },
    };

    return (
        <ConnectionBuilder.Provider value={context}>
            <Show when={upcomingInfo()}>
                <MaterialGraphNodeConnectionCurve
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

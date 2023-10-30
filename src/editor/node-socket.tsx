import { RiArrowsArrowRightLine } from "solid-icons/ri";
import { MaterialNodeSocketInfo } from "../types/material.ts";
import { useMaterialContext } from "./material-context.ts";

interface Props {
    id: string;
    nodeId: number;
    alignment: "left" | "right";
    socket: MaterialNodeSocketInfo;

    onMouseDown(ev: MouseEvent): void;

    onMouseUp(ev: MouseEvent): void;
}

export default function MaterialNodeSocketBox(props: Props) {
    const materialCtx = useMaterialContext()!;
    const hasConnection = () =>
        materialCtx
            .getSocketConnections()
            .some(
                (x) =>
                    (x.from.nodeId === props.nodeId && x.from.socketId === props.id) ||
                    (x.to.nodeId === props.nodeId && x.to.socketId === props.id),
            );

    return (
        <div
            data-socket={props.id}
            class={`relative w-[16px] h-[16px] rounded-full flex items-center justify-center text-gray-700 outline outline-2 ${
                hasConnection()
                    ? "bg-blue-200 outline-blue-500 text-white"
                    : "bg-gray-200 outline-gray-400 hover:bg-gray-300 hover:outline-gray-600"
            }`}
            style={
                props.alignment === "left"
                    ? { left: "-8px", transition: "all 70ms" }
                    : { right: "-8px", transition: "all 70ms" }
            }
            onMouseDown={props.onMouseDown}
            onMouseUp={props.onMouseUp}
            onClick={(ev) => ev.stopPropagation()}
        >
            <RiArrowsArrowRightLine size={12} />
        </div>
    );
}

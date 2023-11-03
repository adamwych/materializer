import { RiArrowsArrowRightLine } from "solid-icons/ri";
import { MaterialNodeSocketInfo } from "../types/material.ts";
import { useMaterialContext } from "./material-context.ts";
import capitalize from "../utils/capitalize.ts";

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
            <div
                class={`pointer-events-none absolute -top-1.5 ${
                    props.alignment === "left" ? "right-[24px]" : "left-[24px]"
                }`}
            >
                <div class="group-hover:opacity-100 opacity-0 transition-all">
                    <span class="text-xs drop-shadow-sm">{capitalize(props.id)}</span>
                </div>
            </div>
            <RiArrowsArrowRightLine size={12} />
        </div>
    );
}

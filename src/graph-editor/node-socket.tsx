import { MaterialNodeSocketInfo } from "../types/material.ts";

interface Props {
    id: string;
    alignment: "left" | "right";
    socket: MaterialNodeSocketInfo;

    onMouseDown(ev: MouseEvent): void;

    onMouseUp(ev: MouseEvent): void;
}

export default function MaterialNodeSocketBox(props: Props) {
    return (
        <div
            data-socket={props.id}
            class="relative w-[16px] h-[16px] rounded-full bg-gray-200-0 outline outline-2 outline-gray-400-0 hover:bg-gray-300-0 hover:outline-gray-600-0"
            style={
                props.alignment === "left"
                    ? { left: "-8px", transition: "all 70ms" }
                    : { right: "-8px", transition: "all 70ms" }
            }
            onMouseDown={props.onMouseDown}
            onMouseUp={props.onMouseUp}
            onClick={(ev) => ev.stopPropagation()}
        ></div>
    );
}

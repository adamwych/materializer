import { RiArrowsArrowRightLine } from "solid-icons/ri";
import { useMaterialStore } from "../../../stores/material";
import { MaterialNodeSocketInfo } from "../../../material/node-socket";
import capitalize from "../../../utils/capitalize";
import { useEditorConnectionBuilder } from "./interaction/connection-builder";
import { useEditorRuntimeCache } from "./cache";

type Props = {
    nodeId: number;
    socket: MaterialNodeSocketInfo;
    alignment: "left" | "right";
};

export default function EditorCanvasNodeSocket(props: Props) {
    const runtimeCache = useEditorRuntimeCache()!;
    const builder = useEditorConnectionBuilder()!;
    const materialActions = useMaterialStore()!;
    const hasConnection = () =>
        materialActions.anyConnectionToSocket(props.nodeId, props.socket.id);

    function updateRuntimeCache(element: HTMLElement) {
        runtimeCache.setNodeSocketDOMElement(props.nodeId, props.socket.id, element);
    }

    return (
        <div
            ref={updateRuntimeCache}
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
            onPointerDown={(ev) => builder.begin(ev, props.nodeId, props.socket.id)}
            onPointerUp={(ev) => builder.end(ev, props.nodeId, props.socket.id)}
            onClick={(ev) => ev.stopPropagation()}
        >
            <div
                class={`pointer-events-none absolute ${
                    props.alignment === "left" ? "right-[24px]" : "left-[24px]"
                }`}
            >
                <div class="group-hover:opacity-100 opacity-0 transition-all">
                    <span class="text-xs drop-shadow-sm">{capitalize(props.socket.id)}</span>
                </div>
            </div>
            <RiArrowsArrowRightLine size={12} />
        </div>
    );
}

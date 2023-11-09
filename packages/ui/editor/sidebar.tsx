import { ParentProps } from "solid-js";
import cn from "../../utils/cn";

type Props = {
    side: "left" | "right";
};

export default function EditorSidebar(props: ParentProps<Props>) {
    return (
        <div
            class={cn(
                "w-[340px] flex flex-col justify-between bg-gray-100  border-gray-200",
                props.side === "left" ? "border-r" : "border-l",
            )}
        >
            {props.children}
        </div>
    );
}

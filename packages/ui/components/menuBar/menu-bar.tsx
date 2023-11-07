import { ParentProps } from "solid-js";
import cn from "../../../utils/cn.ts";

export default function MenuBar(props: ParentProps) {
    return (
        <div class={cn("relative flex items-center", "bg-gray-100", "border-b border-gray-200")}>
            {props.children}
        </div>
    );
}

import { RiSystemCloseFill } from "solid-icons/ri";
import { ParentProps, Show } from "solid-js";
import cn from "../../../utils/cn.ts";

type Props = {
    current?: boolean;
    onClick?(): void;
    onCloseClick?(): void;
};

export default function TabsBarItem(props: ParentProps<Props>) {
    return (
        <div
            class={cn(
                "flex items-center gap-2",
                "px-4 h-[35px]",
                props.current ? "bg-blue-500" : "hover:bg-gray-200 active:bg-gray-100",
                "border-r border-gray-200",
                "animate-fade-scale-in",
            )}
            onClick={props.onClick}
            onAuxClick={props.onCloseClick}
        >
            <span class="text-sm whitespace-nowrap">{props.children}</span>
            <Show when={props.onCloseClick}>
                <div
                    class={cn(
                        "w-[14px] h-[14px] rounded-full",
                        "flex items-center justify-center",
                        "bg-gray-100 bg-opacity-50",
                        "hover:bg-gray-300 hover:bg-opacity-50",
                        "active:bg-gray-200 active:bg-opacity-50",
                    )}
                    onClick={(ev) => {
                        ev.stopPropagation();
                        props.onCloseClick?.();
                    }}
                >
                    <RiSystemCloseFill size={10} />
                </div>
            </Show>
        </div>
    );
}

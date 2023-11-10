import { Dynamic } from "solid-js/web";
import { EditorHistoryEntry, useEditorHistory } from "./canvas/interaction/history";
import cn from "../../utils/cn";

export default function HistoryPanelItem(props: { entry: EditorHistoryEntry }) {
    const history = useEditorHistory()!;

    return (
        <div
            class={cn(
                "h-[34px]",
                "flex items-center justify-between",
                history.stack().top < props.entry.id && "opacity-25",
                history.stack().top === props.entry.id
                    ? "bg-blue-500"
                    : "hover:bg-gray-200 active:bg-gray-100",
                "border-b border-gray-200",
                "px-3",
            )}
            onClick={() => history.revertToAction(props.entry.id)}
        >
            <div class="flex items-center gap-2 max-w-[75%]">
                <Dynamic component={props.entry.icon} />
                <div class="text-sm  overflow-hidden whitespace-nowrap text-ellipsis">
                    {props.entry.name}
                </div>
            </div>
            <span class="text-xs text-gray-700 text-right">
                {props.entry.addedAt.toLocaleTimeString()}
            </span>
        </div>
    );
}

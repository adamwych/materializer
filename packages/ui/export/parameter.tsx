import { JSX } from "solid-js";

export default function ExportDialogParameter(props: {
    label: string;
    description: string;
    inline?: boolean;
    children: JSX.Element;
}) {
    return (
        <div class={props.inline ? "flex items-center justify-between gap-2" : ""}>
            <div class="flex-1">
                <div class="font-semibold text-sm">{props.label}</div>
                <div class="text-sm text-gray-800 mt-1">{props.description}</div>
            </div>
            <div class="flex-1">{props.children}</div>
        </div>
    );
}

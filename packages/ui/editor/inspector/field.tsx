import { ParentProps } from "solid-js";

export default function InspectorPanelField(props: ParentProps<{ label: string }>) {
    return (
        <div class="p-4 border-b border-gray-200 last:border-b-0">
            <div class="font-semibold text-sm">{props.label}</div>
            <div class="pt-2">{props.children}</div>
        </div>
    );
}

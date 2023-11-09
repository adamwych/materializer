import { JSX, ParentProps } from "solid-js";

type Props = {
    label: string;
    titleButtons?: Array<JSX.Element>;
};

export default function InspectorPanelField(props: ParentProps<Props>) {
    return (
        <div class="p-3 border-b border-gray-200 last:border-b-0">
            <div class="flex items-center justify-between">
                <span class="font-semibold text-sm">{props.label}</span>
                {props.titleButtons}
            </div>
            <div class="pt-3">{props.children}</div>
        </div>
    );
}

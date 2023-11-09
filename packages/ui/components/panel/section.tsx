import { JSX, ParentProps } from "solid-js";
import cn from "../../../utils/cn";

type Props = {
    label: string;
    titleButtons?: Array<JSX.Element>;
    class?: string;
};

export default function PanelSection(props: ParentProps<Props>) {
    return (
        <section class={cn("border-b border-gray-200", props.class)}>
            <div class="px-3 py-2 bg-gray-100 border-b border-gray-200">
                <div class="flex items-center justify-between">
                    <span class="text-sm font-semibold uppercase text-gray-800">{props.label}</span>
                    {props.titleButtons}
                </div>
            </div>
            <div>{props.children}</div>
        </section>
    );
}

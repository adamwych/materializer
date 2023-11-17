import { RiSystemRefreshLine } from "solid-icons/ri";
import { JSX, ParentProps } from "solid-js";
import Button from "../../components/button/button";

type Props = {
    label: string;
    titleButtons?: Array<JSX.Element>;
    onReset?(): void;
};

export default function InspectorPanelField(props: ParentProps<Props>) {
    const titleButtons = () => [
        ...(props.titleButtons ?? []),
        props.onReset && (
            <Button
                hint="Reset to default"
                icon={RiSystemRefreshLine}
                size="tiny"
                onClick={props.onReset}
            />
        ),
    ];

    return (
        <div class="p-3 border-b border-gray-200 last:border-b-0">
            <div class="flex items-center justify-between">
                <span class="font-semibold text-sm">{props.label}</span>
                {titleButtons()}
            </div>
            <div class="pt-3">{props.children}</div>
        </div>
    );
}

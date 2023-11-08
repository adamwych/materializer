import { ParentProps } from "solid-js";

export default function ButtonGroup(props: ParentProps) {
    return (
        <div class="button-group flex items-center bg-gray-200 rounded-md">{props.children}</div>
    );
}

import { JSX } from "solid-js";

interface Props {
    children?: JSX.Element;
}

export default function MenuBar(props: Props) {
    return <div class="flex bg-gray-100 border-b border-gray-200">{props.children}</div>;
}

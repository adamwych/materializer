import { JSX } from "solid-js";

interface Props {
    children?: JSX.Element;
}

export default function MenuBar(props: Props) {
    return <div class="flex bg-gray-400">{props.children}</div>;
}

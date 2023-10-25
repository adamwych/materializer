import { JSX } from "solid-js";

interface Props {
    children?: JSX.Element;
}

export default function MenuBar(props: Props) {
    return <div class="bg-gray-400-0 flex">{props.children}</div>;
}

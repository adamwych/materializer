import { JSX } from "solid-js";

interface Props {
    children: JSX.Element;

    onClick(): void;
}

export default function UIButton(props: Props) {
    return (
        <button
            class="px-4 py-2 bg-gray-300-0 hover:bg-gray-200-0 active:bg-gray-100-0 rounded-md cursor-default"
            onClick={props.onClick}
        >
            {props.children}
        </button>
    );
}

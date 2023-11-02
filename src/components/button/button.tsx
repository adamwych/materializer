import { JSX } from "solid-js";

interface Props {
    children: JSX.Element;

    onClick(): void;
}

export default function Button(props: Props) {
    return (
        <button
            class="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 active:bg-gray-100 rounded-md cursor-default"
            onClick={props.onClick}
        >
            {props.children}
        </button>
    );
}

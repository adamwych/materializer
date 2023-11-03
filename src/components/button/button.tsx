import { JSX } from "solid-js";

interface Props {
    children: JSX.Element;
    disabled?: boolean;

    onClick(): void;
}

export default function Button(props: Props) {
    return (
        <button
            class={`px-4 py-2 text-sm rounded-md cursor-default ${
                props.disabled
                    ? "outline outline-1 outline-gray-200 opacity-50"
                    : "bg-gray-200 hover:bg-gray-300 active:bg-gray-100"
            }`}
            disabled={props.disabled}
            onClick={props.onClick}
        >
            {props.children}
        </button>
    );
}

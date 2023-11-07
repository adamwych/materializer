import { JSX } from "solid-js/jsx-runtime";
import { useSelectContext } from "./context.ts";

interface Props {
    children: JSX.Element;
    value: unknown;
}

export default function SelectOption(props: Props) {
    const context = useSelectContext()!;

    return (
        <div
            class="p-2 text-sm bg-gray-0 hover:bg-gray-100 active:bg-gray-200"
            onClick={() => {
                context.setValue(props.value);
                context.close();
            }}
        >
            {props.children}
        </div>
    );
}

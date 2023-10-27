import { JSX } from "solid-js/jsx-runtime";
import { useSelectContext } from "./context";

interface Props {
    children: JSX.Element;
    value: any;
}

export default function SelectOption(props: Props) {
    const context = useSelectContext()!;

    return (
        <div
            class="px-4 py-2 border-t border-gray-200-0 bg-gray-100-0 hover:bg-gray-300-0 active:bg-gray-400-0"
            onClick={() => {
                context.setValue(props.value);
                context.close();
            }}
        >
            {props.children}
        </div>
    );
}

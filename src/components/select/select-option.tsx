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
            class="px-4 py-2 border-t text-sm border-gray-200 bg-gray-100 hover:bg-gray-300 active:bg-gray-400"
            onClick={() => {
                context.setValue(props.value);
                context.close();
            }}
        >
            {props.children}
        </div>
    );
}

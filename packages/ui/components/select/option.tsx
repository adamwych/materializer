import { ParentProps } from "solid-js";
import { useSelectContext } from "./context.ts";

type Props = {
    value: unknown;
};

export default function SelectOption(props: ParentProps<Props>) {
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

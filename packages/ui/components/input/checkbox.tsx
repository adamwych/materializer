import { RiSystemCheckFill } from "solid-icons/ri";

type Props = {
    value: boolean;
    onChange(value: boolean): void;
};

export default function Checkbox(props: Props) {
    return (
        <div
            class={`border border-gray-200 rounded-md ${
                props.value
                    ? "bg-gray-0 hover:bg-gray-100 active:bg-gray-200"
                    : "bg-gray-100 hover:bg-gray-200 active:bg-gray-300"
            }`}
            onClick={() => props.onChange(!props.value)}
        >
            <div class="w-[20px] h-[20px] flex items-center justify-center">
                {props.value && <RiSystemCheckFill />}
            </div>
        </div>
    );
}

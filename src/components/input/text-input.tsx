interface Props {
    value: string;
    center?: boolean;
    readOnly?: boolean;
    onChange?(value: string): void;
    onInput?(value: string): void;
}

export default function TextInput(props: Props) {
    return (
        <input
            class={`w-full outline-none bg-gray-0 p-2 rounded-md text-sm h-[35px] border border-gray-200 ${
                props.center && "text-center"
            } ${props.readOnly && "bg-gray-100 text-gray-800"}`}
            type="text"
            readOnly={props.readOnly}
            value={props.value}
            onChange={(ev) => props.onChange?.(ev.target.value)}
            onInput={(ev) => props.onInput?.(ev.target.value)}
        />
    );
}

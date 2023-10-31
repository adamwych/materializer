interface Props {
    value: any;
    center?: boolean;
    onChange?(value: any): void;
    onInput?(value: any): void;
}

export default function TextInput(props: Props) {
    return (
        <input
            class={`w-full border-none outline-none bg-gray-100 p-2 rounded-sm text-sm ${
                props.center && "text-center"
            }`}
            type="text"
            value={props.value}
            onChange={(ev) => props.onChange?.(ev.target.value)}
            onInput={(ev) => props.onInput?.(ev.target.value)}
        />
    );
}

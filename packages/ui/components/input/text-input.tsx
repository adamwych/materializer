interface Props {
    ref: HTMLInputElement | ((element: HTMLInputElement) => void);
    value: string;
    center?: boolean;
    readOnly?: boolean;
    placeholder?: string;
    class?: string;
    onChange?(value: string): void;
    onInput?(value: string): void;
}

export default function TextInput(props: Props) {
    return (
        <input
            ref={props.ref}
            class={`w-full outline-none bg-gray-0 p-2 rounded-md text-sm h-[35px] border border-gray-200 ${
                props.center && "text-center"
            } ${props.readOnly && "bg-gray-100 text-gray-800"} ${props.class}`}
            type="text"
            readOnly={props.readOnly}
            value={props.value}
            placeholder={props.placeholder}
            onChange={(ev) => props.onChange?.(ev.target.value)}
            onInput={(ev) => props.onInput?.(ev.target.value)}
        />
    );
}

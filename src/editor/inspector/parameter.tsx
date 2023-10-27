import MaterialNodeInspectorRGBInput from "./input-rgb.tsx";
import { Accessor, Component, Show } from "solid-js";

export type InputProps<T = any> = {
    value: Accessor<T>;
    onChange(value: T): void;
};

interface Props {
    label: string;
    type: string;
    value: Accessor<unknown>;

    onChange(value: unknown): void;
}

function getInputComponent(type: string): Component<InputProps> | undefined {
    switch (type) {
        case "rgb":
            return MaterialNodeInspectorRGBInput;
        default:
            console.error(`Parameter of type '${type}' is not supported.`);
            return undefined;
    }
}

export default function MaterialNodeInspectorParameter(props: Props) {
    const InputComponent = getInputComponent(props.type)!;

    return (
        <div class="p-4 border-b border-gray-300-0">
            <div class="font-semibold">{props.label}</div>
            <div class="pt-2">
                <Show when={InputComponent}>
                    <InputComponent value={props.value} onChange={props.onChange} />
                </Show>
                <Show when={!InputComponent}>
                    <span class="text-gray-800-0">Unsupported parameter type: {props.type}</span>
                </Show>
            </div>
        </div>
    );
}

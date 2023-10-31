import { MaterialNodeParameterInfo, MaterialNodeParameterType } from "../../types/material.ts";
import MaterialNodeInspectorNumberInput from "./input-number.tsx";
import MaterialNodeInspectorRGBInput from "./input-rgb.tsx";
import { Accessor, Component, JSX, Show } from "solid-js";
import MaterialNodeInspectorSelectInput from "./input-select.tsx";

export type InputProps<T = any> = {
    parameter: Partial<MaterialNodeParameterInfo>;
    value: Accessor<T>;
    onChange(value: T): void;
};

interface Props {
    children?: JSX.Element;
    parameter: Partial<MaterialNodeParameterInfo>;
    value: Accessor<unknown>;
    onChange(value: unknown): void;
}

function getInputComponent(type: MaterialNodeParameterType): Component<InputProps> | undefined {
    switch (type) {
        case "rgb":
            return MaterialNodeInspectorRGBInput;
        case "number":
            return MaterialNodeInspectorNumberInput;
        case "select":
            return MaterialNodeInspectorSelectInput;
        default:
            console.error(`Parameter of type '${type}' is not supported.`);
            return undefined;
    }
}

export default function MaterialNodeInspectorParameter(props: Props) {
    const InputComponent = getInputComponent(props.parameter.type!)!;

    return (
        <div class="px-4 py-2 border-b border-gray-300">
            <div class="font-semibold text-sm">{props.parameter.label}</div>
            <div class="pt-2">
                <Show when={InputComponent}>
                    <InputComponent
                        parameter={props.parameter}
                        value={props.value}
                        onChange={props.onChange}
                    />
                </Show>
                <Show when={!InputComponent}>
                    <span class="text-washed-red-900">
                        Unsupported parameter type: {props.parameter.type}
                    </span>
                </Show>
                {props.children}
            </div>
        </div>
    );
}

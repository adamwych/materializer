import { Accessor, Component, JSX, Show } from "solid-js";
import {
    MaterialNodeParameterInfo,
    ParameterInputInfo,
    ParameterInputType,
} from "../../../types/node-parameter.ts";
import MaterialNodeInspectorNumberInput from "./inputs/number.tsx";
import MaterialNodeInspectorRGBInput from "./inputs/rgb.tsx";
import MaterialNodeInspectorSelectInput from "./inputs/select.tsx";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type InputProps<I extends ParameterInputInfo = any, V = any> = {
    parameter: MaterialNodeParameterInfo & I;
    value: Accessor<V>;
    onChange(value: V): void;
};

interface Props {
    children?: JSX.Element;
    parameter: MaterialNodeParameterInfo;
    value: Accessor<unknown>;
    onChange(value: unknown): void;
}

const InputComponents: Record<ParameterInputType, Component<InputProps>> = {
    rgb: MaterialNodeInspectorRGBInput,
    number: MaterialNodeInspectorNumberInput,
    select: MaterialNodeInspectorSelectInput,
};

export default function InspectorNodeParameter(props: Props) {
    const InputComponent = InputComponents[props.parameter.inputType];

    return (
        <div class="px-4 py-2 border-b border-gray-300">
            <div class="font-semibold text-sm">{props.parameter.name}</div>
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
                        Unsupported parameter type: {props.parameter.inputType}
                    </span>
                </Show>
                {props.children}
            </div>
        </div>
    );
}

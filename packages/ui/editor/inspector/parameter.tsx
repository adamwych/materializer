import { RiSystemRefreshLine } from "solid-icons/ri";
import { Accessor, Component, JSX, Show } from "solid-js";
import {
    MaterialNodeParameterInfo,
    ParameterInputInfo,
    ParameterInputType,
} from "../../../material/node-parameter.ts";
import Button from "../../components/button/button.tsx";
import InspectorPanelField from "./field.tsx";
import MaterialNodeInspectorNumberInput from "./inputs/number.tsx";
import MaterialNodeInspectorRGBInput from "./inputs/rgb.tsx";
import MaterialNodeInspectorSelectInput from "./inputs/select.tsx";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type InputProps<I extends ParameterInputInfo = any, V = any> = {
    parameter: MaterialNodeParameterInfo & I;
    value: Accessor<V>;
    onChange(value: V): void;
};

type Props<V> = {
    children?: JSX.Element;
    parameter: MaterialNodeParameterInfo;
    value: Accessor<V>;
    onChange(value: V): void;
    onResetToDefault(): void;
};

const InputComponents: Record<ParameterInputType, Component<InputProps>> = {
    rgb: MaterialNodeInspectorRGBInput,
    number: MaterialNodeInspectorNumberInput,
    select: MaterialNodeInspectorSelectInput,
};

export default function InspectorNodeParameter<V>(props: Props<V>) {
    const InputComponent = InputComponents[props.parameter.inputType];

    return (
        <InspectorPanelField
            label={props.parameter.name}
            titleButtons={[
                <Button
                    hint="Reset to default"
                    icon={RiSystemRefreshLine}
                    size="tiny"
                    onClick={props.onResetToDefault}
                />,
            ]}
        >
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
        </InspectorPanelField>
    );
}

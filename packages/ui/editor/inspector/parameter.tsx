import { Accessor, Component, ParentProps, Show } from "solid-js";
import { unwrap } from "solid-js/store";
import {
    MaterialNodeParameterInfo,
    ParameterInputInfo,
    ParameterInputType,
} from "../../../material/node-parameter.ts";
import { MaterialNode } from "../../../material/node.ts";
import { useEditorHistory } from "../canvas/interaction/history.ts";
import InspectorPanelField from "./field.tsx";
import MaterialNodeInspectorNumberInput from "./inputs/number.tsx";
import MaterialNodeInspectorRGBInput from "./inputs/rgb.tsx";
import MaterialNodeInspectorSelectInput from "./inputs/select.tsx";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type InputProps<I extends ParameterInputInfo = any, V = any> = {
    parameter: MaterialNodeParameterInfo & I;
    value: Accessor<V>;
    onChange(value: V): void;
    onFocus(): void;
    onBlur(): void;
};

type Props<V> = {
    node: MaterialNode;
    parameter: MaterialNodeParameterInfo;
    value: Accessor<V>;
    onChange(nodeId: number, value: V): void;
    onResetToDefault(): void;
};

const InputComponents: Record<ParameterInputType, Component<InputProps>> = {
    rgb: MaterialNodeInspectorRGBInput,
    number: MaterialNodeInspectorNumberInput,
    select: MaterialNodeInspectorSelectInput,
};

export default function InspectorNodeParameter<V>(props: ParentProps<Props<V>>) {
    const InputComponent = InputComponents[props.parameter.inputType];
    const history = useEditorHistory()!;
    let startValue: V;
    let didChange = false;

    function onChange(value: V) {
        didChange = true;
        props.onChange(props.node.id, value);
    }

    function onFocus() {
        startValue = structuredClone(unwrap(props.value()));
    }

    function onBlur() {
        const newValue = structuredClone(unwrap(props.value()));

        // Note: Checking (newValue !== startValue) doesn't always work,
        // because apparently `onFocus` and `onChange` might be called at the same
        // frame (`onFocus` is then called after `onChange`). Very hard to reproduce.
        if (didChange) {
            history.pushNodeParameterValueChanged(
                props.node,
                props.parameter.id,
                newValue,
                startValue,
            );
        }

        didChange = false;
    }

    return (
        <InspectorPanelField label={props.parameter.name} onReset={props.onResetToDefault}>
            <Show when={InputComponent}>
                <InputComponent
                    parameter={props.parameter}
                    value={props.value}
                    onChange={onChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
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

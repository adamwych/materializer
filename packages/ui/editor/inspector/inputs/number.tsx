import { Accessor, For, createEffect, createSignal } from "solid-js";
import { NumberParameterInputInfo } from "../../../../material/node-parameter";
import HorizontalSlider from "../../../components/slider/horizontalSlider";
import { InputProps } from "../parameter";

export default function MaterialNodeInspectorNumberInput(
    props: InputProps<NumberParameterInputInfo, number | Array<number>>,
) {
    const isFloat = props.parameter.valueType !== "int" && props.parameter.valueType !== "ivec2";

    function onChange(index: number, value: number) {
        const currentValue = props.value() as Array<number>;
        const newValue = [...currentValue];
        newValue[index] = value;
        props.onChange(newValue);
    }

    function InnerInput({
        value,
        onChange,
    }: {
        value: Accessor<number>;
        onChange: (value: number) => void;
    }) {
        const [maxScale, setMaxScale] = createSignal(1);

        createEffect(() => {
            const max = props.parameter.inputProps.max ?? 1;
            if (value() > max * maxScale()) {
                setMaxScale((s) => s * 2);
            }
        });

        return (
            <div class="flex items-center gap-4">
                <input
                    style={{ width: "44px" }}
                    class="hide-spin-button py-0.5 outline-none bg-gray-0 border border-gray-200 text-xs text-center rounded-md"
                    type="number"
                    value={isFloat ? value().toFixed(2) : value()}
                    onChange={(ev) =>
                        onChange(isFloat ? parseFloat(ev.target.value) : parseInt(ev.target.value))
                    }
                />

                <HorizontalSlider
                    min={props.parameter.inputProps.min ?? 0}
                    max={(props.parameter.inputProps.max ?? 1) * maxScale()}
                    step={props.parameter.inputProps.step ?? 0.01}
                    value={value()}
                    onChange={(value) => onChange(isFloat ? value : Math.round(value))}
                    onFocus={props.onFocus}
                    onBlur={props.onBlur}
                />
            </div>
        );
    }

    const numberOfInputs = getNumberOfInputs(props.parameter);
    if (numberOfInputs === 1) {
        return <InnerInput value={() => props.value() as number} onChange={props.onChange} />;
    }

    return (
        <div class="flex flex-col gap-2">
            <For each={Array(numberOfInputs).fill(0)}>
                {(_, index) => (
                    <InnerInput
                        value={() => (props.value() as Array<number>)[index()]}
                        onChange={(v) => onChange(index(), v)}
                    />
                )}
            </For>
        </div>
    );
}

function getNumberOfInputs(parameter: NumberParameterInputInfo) {
    if (parameter.valueType === "vec2" || parameter.valueType === "ivec2") {
        return 2;
    } else if (parameter.valueType === "vec3") {
        return 3;
    }

    return 1;
}

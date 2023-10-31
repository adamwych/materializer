import { createEffect, createSignal } from "solid-js";
import HorizontalSlider from "../../components/slider/horizontal-slider";
import { InputProps } from "./parameter";

export default function MaterialNodeInspectorNumberInput(props: InputProps<number>) {
    const [maxScale, setMaxScale] = createSignal(1);
    const isFloat = props.parameter.valueType === "float";

    createEffect(() => {
        const max = props.parameter.max ?? 1;
        if (props.value() > max * maxScale()) {
            setMaxScale((s) => s * 2);
        }
    });

    return (
        <div class="flex items-center gap-4">
            <HorizontalSlider
                min={props.parameter.min ?? 0}
                max={(props.parameter.max ?? 1) * maxScale()}
                step={props.parameter.step ?? 0.01}
                value={props.value()}
                onChange={(value) => props.onChange(isFloat ? value : Math.round(value))}
            />

            <input
                style={{ width: "54px" }}
                class="border-none outline-none bg-transparent text-center"
                type="number"
                value={isFloat ? props.value().toFixed(2) : props.value()}
                onChange={(ev) =>
                    props.onChange(
                        isFloat ? parseFloat(ev.target.value) : parseInt(ev.target.value),
                    )
                }
            />
        </div>
    );
}

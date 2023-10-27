import { createEffect, createSignal } from "solid-js";
import HorizontalSlider from "../../components/slider/horizontal-slider";
import { InputProps } from "./parameter";

export default function MaterialNodeInspectorNumberInput(props: InputProps<number>) {
    const [maxScale, setMaxScale] = createSignal(1);

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
                value={props.value()}
                onChange={props.onChange}
            />

            <input
                style={{ width: "54px" }}
                class="border-none outline-none bg-transparent text-center"
                type="number"
                value={props.value().toFixed(1)}
                onChange={(ev) => props.onChange(parseFloat(ev.target.value))}
            />
        </div>
    );
}

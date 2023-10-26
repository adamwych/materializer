import { Accessor, JSX } from "solid-js";

interface Props {
    value: Accessor<[number, number, number]>;

    onChange(value: [number, number, number]): void;
}

export default function MaterialNodeInspectorRGBInput(props: Props) {
    function SliderInput({
        label,
        value,
        onInput,
    }: {
        label: string;
        value: Accessor<number>;
        onInput: JSX.InputEventHandlerUnion<HTMLInputElement, InputEvent>;
    }) {
        return (
            <div class="flex items-center gap-4 w-full">
                <div class="w-2">{label}</div>
                <input class="w-full" type="range" min="0" max="1" step="0.01" value={value()} onInput={onInput} />
            </div>
        );
    }

    return (
        <div class="w-full">
            <SliderInput
                label="R"
                value={() => props.value()[0]}
                onInput={(e) => props.onChange([parseFloat(e.target.value), props.value()[1], props.value()[2]])}
            />
            <SliderInput
                label="G"
                value={() => props.value()[1]}
                onInput={(e) => props.onChange([props.value()[0], parseFloat(e.target.value), props.value()[2]])}
            />
            <SliderInput
                label="B"
                value={() => props.value()[2]}
                onInput={(e) => props.onChange([props.value()[0], props.value()[1], parseFloat(e.target.value)])}
            />
        </div>
    );
}

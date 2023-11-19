import { unwrap } from "solid-js/store";
import HorizontalSlider from "../../components/slider/horizontalSlider";

type Props = {
    value: number;
    onChange(value: number): void;
    onBlur?(startValue: number): void;
};

export default function HorizontalTextureSizeSlider(props: Props) {
    let startValue: number;

    function onFocus() {
        startValue = unwrap(props.value);
    }

    function onBlur() {
        props.onBlur?.(startValue);
    }

    return (
        <div class="flex items-center justify-between">
            <span class="w-[96px] text-sm">
                {props.value}x{props.value}
            </span>
            <HorizontalSlider
                min={1}
                max={2048}
                step={props.value < 128 ? 16 : 32}
                value={props.value}
                onChange={props.onChange}
                onFocus={onFocus}
                onBlur={onBlur}
            />
        </div>
    );
}

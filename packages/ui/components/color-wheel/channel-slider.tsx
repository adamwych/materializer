import { TailwindColorName } from "../../../types/tailwind.ts";
import VerticalSlider from "../slider/verticalSlider.tsx";

export default function ColorWheelChannelSlider(props: {
    label: string;
    value: number;
    min: number;
    max: number;
    color: TailwindColorName;
    onChange(value: number): void;
    onFocus?(): void;
    onBlur?(): void;
}) {
    return (
        <div class="h-full flex flex-col gap-2 items-center">
            <span class="text-sm">{props.label}</span>

            <VerticalSlider
                min={props.min}
                max={props.max}
                value={props.value}
                color={props.color}
                onChange={props.onChange}
                onFocus={props.onFocus}
                onBlur={props.onBlur}
            />

            <span class="text-center text-sm" style={{ width: "30px" }}>
                {props.max <= 1 ? props.value.toFixed(2) : Math.round(props.value)}
            </span>
        </div>
    );
}

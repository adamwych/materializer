import { TailwindColorName } from "../../../types/tailwind.ts";
import VerticalSlider from "../slider/verticalSlider.tsx";

export default function ColorWheelChannelSlider(props: {
    label: string;
    value: number;
    min: number;
    max: number;
    color: TailwindColorName;
    onChange(value: number): void;
}) {
    return (
        <div class="h-full flex flex-col gap-2 items-center">
            <span class="text-sm">{props.label}</span>

            <VerticalSlider
                min={props.min}
                max={props.max}
                value={props.value}
                onChange={props.onChange}
                color={props.color}
            />

            <span class="text-center text-sm" style={{ width: "30px" }}>
                {props.max <= 1 ? props.value.toFixed(2) : Math.round(props.value)}
            </span>
        </div>
    );
}

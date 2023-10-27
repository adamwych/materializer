import { TailwindColorName } from "../../types/tailwind";
import VerticalSlider from "../slider/vertical-slider";

export default function ColorWheelChannelValueSlider(props: {
    label: string;
    value: number;
    color: TailwindColorName;
    onChange(value: number): void;
}) {
    return (
        <div class="h-full flex flex-col gap-2 items-center">
            <span class="text-sm">{props.label}</span>

            <VerticalSlider
                min={0}
                max={1}
                value={props.value}
                onChange={props.onChange}
                color={props.color}
            />

            <span class="text-center text-sm" style={{ width: "30px" }}>
                {Math.round(props.value * 255)}
            </span>
        </div>
    );
}

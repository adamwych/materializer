import * as culori from "culori";
import { clamp, distance2d, toDegrees, toRadians } from "../../utils/math";
import makeMouseMoveListener from "../../utils/makeMouseMoveListener";
import ColorWheelChannelValueSlider from "./channel-slider";

interface Props {
    size?: number;
    value: [number, number, number];
    onChange(value: [number, number, number]): void;
}

export default function ColorWheel(props: Props) {
    let wheelElementRef: HTMLElement | undefined;
    const wheelSize = props.size ?? 194;
    const hsv = () =>
        culori.convertRgbToHsv({
            r: props.value[0],
            g: props.value[1],
            b: props.value[2],
        });
    const boxCoords = () => {
        const { h, s } = hsv();
        const angle = toRadians((h ?? 0) - 90);
        return {
            x: Math.cos(angle) * ((s * wheelSize) / 2) + wheelSize / 2,
            y: Math.sin(angle) * ((s * wheelSize) / 2) - wheelSize / 2,
        };
    };

    const onMouseDown = makeMouseMoveListener((ev) => {
        const wheelRect = wheelElementRef!.getBoundingClientRect()!;
        const wheelCenter = {
            x: wheelRect.x + wheelRect.width / 2,
            y: wheelRect.y + wheelRect.height / 2,
        };

        // Distance from the center of the circle to current mouse position is
        // the saturation, but it must be within [0..1] range.
        const distance = distance2d(ev.pageX, ev.pageY, wheelCenter.x, wheelCenter.y);
        const saturation = clamp(distance / (wheelSize / 2), 0, 1);

        // Hue is the angle between mouse position and the center of the wheel.
        let hue = toDegrees(Math.atan2(ev.pageY - wheelCenter.y, ev.pageX - wheelCenter.x)) + 90;

        // Map it from [-180..180] to [0..360] range.
        if (hue < 0) {
            hue += 360;
        }

        const rgb = culori.convertHsvToRgb({ h: hue, s: saturation, v: hsv().v });
        props.onChange([rgb.r, rgb.g, rgb.b]);
    });

    function onBrightnessChange(value: number) {
        const { h, s } = hsv();
        const rgb = culori.convertHsvToRgb({ h, s, v: value });
        props.onChange([rgb.r, rgb.g, rgb.b]);
    }

    function onRGBChannelChange(index: number, value: number) {
        const newValue = [...props.value] as [number, number, number];
        newValue[index] = value;
        props.onChange(newValue);
    }

    return (
        <div class="flex items-center justify-center gap-8" style={{ height: wheelSize + "px" }}>
            <div class="relative">
                <div
                    ref={(e) => (wheelElementRef = e)}
                    style={{
                        width: wheelSize + "px",
                        height: wheelSize + "px",
                        background: "url(color-circle.png)",
                        "background-size": "contain",
                        "background-repeat": "no-repeat",
                        filter: `brightness(${hsv().v})`,
                    }}
                    onMouseDown={onMouseDown}
                />
                <div
                    class="absolute bg-opacity-25 bg-white rounded-full border border-white"
                    style={{
                        width: "12px",
                        height: "12px",
                        transform: `translate(${boxCoords().x - 6}px, ${boxCoords().y - 6}px)`,
                    }}
                />
            </div>

            <div class="h-full flex gap-2">
                <ColorWheelChannelValueSlider
                    label="V"
                    color="gray"
                    value={hsv().v}
                    onChange={onBrightnessChange}
                />
                <ColorWheelChannelValueSlider
                    label="R"
                    color="washed-red"
                    value={props.value[0]}
                    onChange={(v) => onRGBChannelChange(0, v)}
                />
                <ColorWheelChannelValueSlider
                    label="G"
                    color="washed-green"
                    value={props.value[1]}
                    onChange={(v) => onRGBChannelChange(1, v)}
                />
                <ColorWheelChannelValueSlider
                    label="B"
                    color="washed-blue"
                    value={props.value[2]}
                    onChange={(v) => onRGBChannelChange(2, v)}
                />
            </div>
        </div>
    );
}

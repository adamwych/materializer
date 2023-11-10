import * as culori from "culori";
import ColorWheelChannelSlider from "./channel-slider.tsx";

export default function ColorWheelHSVChannelSliders(props: {
    value: [number, number, number];
    onChange(value: [number, number, number]): void;
    onFocus?(): void;
    onBlur?(): void;
}) {
    const hsv = () =>
        culori.convertRgbToHsv({
            r: props.value[0],
            g: props.value[1],
            b: props.value[2],
        });

    function onHueChannelChange(value: number) {
        const { s, v } = hsv();

        // Setting hue to 360 would make the slider jump back to 0, because internally
        // the value is RGB, so converting it from HSV to RGB would result in hue = 0.
        // Using 359.9 gives full red color and fixes the issue.
        if (value >= 360) {
            value = 359.9;
        }

        const rgb = culori.convertHsvToRgb({ h: value, s, v });
        props.onChange([rgb.r, rgb.g, rgb.b]);
    }

    function onSaturationChannelChange(value: number) {
        const { h, v } = hsv();
        const rgb = culori.convertHsvToRgb({ h: h ?? 0, s: value, v });
        props.onChange([rgb.r, rgb.g, rgb.b]);
    }

    function onValueChannelChange(value: number) {
        const { h, s } = hsv();
        const rgb = culori.convertHsvToRgb({ h: h ?? 0, s, v: value });
        props.onChange([rgb.r, rgb.g, rgb.b]);
    }

    return (
        <>
            <ColorWheelChannelSlider
                label="H"
                color="gray"
                value={hsv().h ?? 0}
                min={0}
                max={360}
                onChange={onHueChannelChange}
                onFocus={props.onFocus}
                onBlur={props.onBlur}
            />
            <ColorWheelChannelSlider
                label="S"
                color="gray"
                value={hsv().s}
                min={0}
                max={1}
                onChange={onSaturationChannelChange}
                onFocus={props.onFocus}
                onBlur={props.onBlur}
            />
            <ColorWheelChannelSlider
                label="V"
                color="gray"
                value={hsv().v}
                min={0}
                max={1}
                onChange={onValueChannelChange}
                onFocus={props.onFocus}
                onBlur={props.onBlur}
            />
        </>
    );
}

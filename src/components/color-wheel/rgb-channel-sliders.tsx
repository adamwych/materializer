import ColorWheelChannelSlider from "./channel-slider";

export default function ColorWheelRGBChannelSliders(props: {
    value: [number, number, number];
    onChange(value: [number, number, number]): void;
}) {
    function onValueChange(index: number, value: number) {
        const newValue = [...props.value] as [number, number, number];
        newValue[index] = value / 255;
        props.onChange(newValue);
    }

    return (
        <>
            <ColorWheelChannelSlider
                label="R"
                color="washed-red"
                min={0}
                max={255}
                value={props.value[0] * 255}
                onChange={(v) => onValueChange(0, v)}
            />
            <ColorWheelChannelSlider
                label="G"
                color="washed-green"
                min={0}
                max={255}
                value={props.value[1] * 255}
                onChange={(v) => onValueChange(1, v)}
            />
            <ColorWheelChannelSlider
                label="B"
                color="washed-blue"
                min={0}
                max={255}
                value={props.value[2] * 255}
                onChange={(v) => onValueChange(2, v)}
            />
        </>
    );
}

import * as culori from "culori";
import TextInput from "../input/text-input";

export default function ColorWheelHexTextInput(props: {
    value: [number, number, number];
    onChange(value: [number, number, number]): void;
}) {
    const hexValue = () => {
        return culori.formatHex({
            mode: "rgb",
            r: props.value[0],
            g: props.value[1],
            b: props.value[2],
        });
    };

    function onHexValueChanged(value: string) {
        const color = culori.parseHex(value) as culori.Rgb;
        if (color) {
            props.onChange([color.r, color.g, color.b]);
        }
    }

    return <TextInput center value={hexValue()} onChange={onHexValueChanged} />;
}

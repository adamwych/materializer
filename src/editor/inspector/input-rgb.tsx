import { Accessor } from "solid-js";
import ColorWheel from "../../components/color-wheel/color-wheel";

interface Props {
    value: Accessor<[number, number, number]>;

    onChange(value: [number, number, number]): void;
}

export default function MaterialNodeInspectorRGBInput(props: Props) {
    return <ColorWheel value={props.value()} onChange={props.onChange} />;
}

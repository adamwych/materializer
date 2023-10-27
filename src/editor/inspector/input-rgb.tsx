import ColorWheel from "../../components/color-wheel/color-wheel";
import { InputProps } from "./parameter";

export default function MaterialNodeInspectorRGBInput(props: InputProps<[number, number, number]>) {
    return <ColorWheel value={props.value()} onChange={props.onChange} />;
}

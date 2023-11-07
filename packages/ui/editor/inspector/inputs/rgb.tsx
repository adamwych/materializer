import ColorWheel from "../../../components/color-wheel/color-wheel";
import { RgbParameterInputInfo } from "../../../../types/node-parameter";
import { InputProps } from "../parameter";

export default function MaterialNodeInspectorRGBInput(
    props: InputProps<RgbParameterInputInfo, [number, number, number]>,
) {
    return <ColorWheel value={props.value()} onChange={props.onChange} />;
}

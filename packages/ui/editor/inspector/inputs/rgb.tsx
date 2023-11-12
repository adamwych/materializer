import ColorWheel from "../../../components/color-wheel/color-wheel";
import { RgbParameterInputInfo } from "../../../../material/node-parameter";
import { InputProps } from "../parameter";
import GrayscaleSlider from "../../../components/grayscale-slider/grayscale-slider";

export default function MaterialNodeInspectorRGBInput(
    props: InputProps<RgbParameterInputInfo, [number, number, number]>,
) {
    return (
        <>
            <ColorWheel
                value={props.value()}
                onChange={props.onChange}
                onFocus={props.onFocus}
                onBlur={props.onBlur}
            />

            <div class="h-4" />

            <GrayscaleSlider
                value={props.value()[0]}
                onChange={(value) => props.onChange([value, 0, 0])}
                onFocus={props.onFocus}
                onBlur={props.onBlur}
            />

            <div class="text-sm text-gray-800 mt-2">
                Note: For now, all textures use RGB format and grayscale values are kept in the red
                channel.
            </div>
        </>
    );
}

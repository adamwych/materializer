import { unwrap } from "solid-js/store";
import { MaterialNode } from "../../../material/node";
import { useMaterialStore } from "../../../stores/material";
import HorizontalSlider from "../../components/slider/horizontalSlider";
import { useEditorHistory } from "../canvas/interaction/history";
import InspectorPanelField from "./field";

type Props = {
    node: MaterialNode;
};

export default function InspectorNodeTextureSizeParameter(props: Props) {
    const materialStore = useMaterialStore()!;
    const history = useEditorHistory()!;
    let startValue: number;

    function onSliderPointerDown() {
        startValue = unwrap(props.node.textureSize);
    }

    function onSliderPointerUp() {
        const newValue = unwrap(props.node.textureSize);
        history.pushNodeTextureSizeChanged(props.node, newValue, startValue);
    }

    return (
        <InspectorPanelField label="Size">
            <div class="flex items-center justify-between">
                <span class="w-[96px] text-sm">
                    {props.node.textureSize}x{props.node.textureSize}
                </span>
                <HorizontalSlider
                    min={1}
                    max={2048}
                    step={props.node.textureSize < 128 ? 16 : 32}
                    value={props.node.textureSize}
                    onChange={(v) =>
                        materialStore.setNodeTextureSize(props.node.id, v, true, false)
                    }
                    onPointerDown={onSliderPointerDown}
                    onPointerUp={onSliderPointerUp}
                />
            </div>

            {props.node.path === "materializer/solid-color" && (
                <div class="text-xs text-gray-800 mt-2">
                    <strong>Note:</strong> Increasing texture size of a 'Solid color' node does not
                    bring any benefits and will waste your GPU's memory.
                </div>
            )}
        </InspectorPanelField>
    );
}

import { RiOthersBox3Fill } from "solid-icons/ri";
import { onMount } from "solid-js";
import { useRenderEngine } from "../../renderer/engine";
import { EnvironmentalPreviewShape, getEnvPreviewShapeGltf } from "../../renderer/preview-shape";
import makeDragListener from "../../utils/makeDragListener";
import { toRadians } from "../../utils/math";
import MenuButton from "../components/button/menu-button";
import MenuButtonOption from "../components/button/menu-button-option";
import PanelSection from "../components/panel/section";

export default function EditorEnvironmentPreviewPanel() {
    const renderer = useRenderEngine()!;
    let rotationX = toRadians(225);
    let rotationY = toRadians(-135);
    let zoom = 3;

    function initialize(canvas: HTMLCanvasElement) {
        requestAnimationFrame(() => {
            renderer.setEnvironmentPreviewDestination(canvas.transferControlToOffscreen());
        });
    }

    function onPointerDown() {
        makeDragListener((ev) => {
            rotationX += ev.movementX / 50;
            rotationY -= ev.movementY / 50;
            renderer.setEnvironmentPreviewCameraTransform(rotationX, rotationY, zoom);
        });
    }

    function onWheel(ev: WheelEvent) {
        zoom *= ev.deltaY > 0 ? 1.2 : 1 / 1.2;
        renderer.setEnvironmentPreviewCameraTransform(rotationX, rotationY, zoom);
    }

    function setShape(shape: EnvironmentalPreviewShape) {
        renderer.setEnvironmentPreviewModel(getEnvPreviewShapeGltf(shape));
    }

    return (
        <PanelSection
            label="Preview"
            titleButtons={[
                <MenuButton size="small" icon={RiOthersBox3Fill}>
                    <MenuButtonOption
                        label="Cube"
                        onClick={() => setShape(EnvironmentalPreviewShape.Cube)}
                    />
                    <MenuButtonOption
                        label="Plane"
                        onClick={() => setShape(EnvironmentalPreviewShape.Plane)}
                    />
                </MenuButton>,
            ]}
        >
            <canvas
                ref={(e) => onMount(() => initialize(e))}
                class="w-full"
                width="340px"
                height="340px"
                onPointerDown={onPointerDown}
                onWheel={onWheel}
            />
        </PanelSection>
    );
}

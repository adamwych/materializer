import { RiOthersBox3Fill } from "solid-icons/ri";
import { createSignal, onMount } from "solid-js";
import { useRenderEngine } from "../../renderer/engine";
import { Preview3dShape, get3dPreviewShapeGltf } from "../../renderer/preview-3d";
import cn from "../../utils/cn";
import makeDragListener from "../../utils/makeDragListener";
import Button from "../components/button/button";
import MenuButton from "../components/button/menu-button";
import MenuButtonOption from "../components/button/menu-button-option";
import PanelSection from "../components/panel/section";
import Preview3dCamera from "./preview-camera";

export default function EditorEnvironmentPreviewPanel() {
    let panelSectionElement: HTMLElement;
    const renderer = useRenderEngine()!;
    const camera = new Preview3dCamera(340, 340);
    const [fullscreen, setFullscreen] = createSignal(false);

    function initialize(canvas: HTMLCanvasElement) {
        requestAnimationFrame(() => {
            renderer.set3dPreviewCanvas(canvas.transferControlToOffscreen());
            renderer.update3dPreviewSettings(camera.createSettings());
        });
    }

    function onPointerDown() {
        makeDragListener((ev) => {
            renderer.update3dPreviewSettings(camera.rotate(ev.movementX / 50, ev.movementY / 50));
        });
    }

    function onWheel(ev: WheelEvent) {
        renderer.update3dPreviewSettings(camera.zoom(ev.deltaY > 0 ? 1.2 : 1 / 1.2));
    }

    function setShape(shape: Preview3dShape) {
        renderer.update3dPreviewSettings({
            shape: get3dPreviewShapeGltf(shape),
        });
    }

    function toggleFullscreen() {
        if (fullscreen()) {
            setFullscreen(false);
            renderer.update3dPreviewSettings(camera.resize(340, 340));
        } else {
            setFullscreen(true);
            renderer.update3dPreviewSettings(camera.resize(window.innerWidth, window.innerHeight));
        }
    }

    return (
        <PanelSection
            ref={panelSectionElement!}
            class={cn(fullscreen() && "fixed top-0 left-0 w-full h-full z-50")}
            label="Preview"
            titleButtons={[
                <Button size="small" onClick={toggleFullscreen}>
                    Fullscreen
                </Button>,
                <MenuButton size="small" icon={RiOthersBox3Fill}>
                    <MenuButtonOption
                        label="Plane"
                        onClick={() => setShape(Preview3dShape.Plane)}
                    />
                    <MenuButtonOption
                        label="Plane (hi-res)"
                        onClick={() => setShape(Preview3dShape.PlaneHiRes)}
                    />
                    <MenuButtonOption label="Cube" onClick={() => setShape(Preview3dShape.Cube)} />
                    <MenuButtonOption
                        label="Cube (hi-res)"
                        onClick={() => setShape(Preview3dShape.CubeHiRes)}
                    />
                    <MenuButtonOption
                        label="Sphere"
                        onClick={() => setShape(Preview3dShape.Sphere)}
                    />
                </MenuButton>,
            ]}
        >
            <canvas
                ref={(e) => onMount(() => initialize(e))}
                class="w-full"
                width="340px"
                height="340px"
                style={{ transform: "rotateX(180deg)" }}
                onPointerDown={onPointerDown}
                onWheel={onWheel}
            />
        </PanelSection>
    );
}

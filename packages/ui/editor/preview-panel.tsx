import {
    RiMediaFullscreenFill,
    RiOthersBox3Fill,
    RiOthersLightbulbFill,
    RiSystemLoader2Fill,
} from "solid-icons/ri";
import { createSignal, onMount } from "solid-js";
import { useRenderEngine } from "../../renderer/engine";
import {
    Preview3dEnvironmentMap,
    Preview3dShape,
    get3dPreviewEnvironmentMapUrl,
    get3dPreviewShapeGltf,
} from "../../renderer/preview-3d";
import cn from "../../utils/cn";
import makeDragListener from "../../utils/makeDragListener";
import Button from "../components/button/button";
import MenuButton from "../components/button/menu-button";
import MenuButtonOption from "../components/button/menu-button-option";
import PanelSection from "../components/panel/section";
import Preview3dCamera from "./preview-camera";

const ENVIRONMENT_MAPS: Array<[string, Preview3dEnvironmentMap]> = [
    ["Wasteland Clouds", Preview3dEnvironmentMap.WastelandClouds],
    ["Meadow", Preview3dEnvironmentMap.Meadow],
    ["Little Paris Under Tower", Preview3dEnvironmentMap.LittleParisUnderTower],
    ["Rustig Koppie", Preview3dEnvironmentMap.RustigKoppie],
];

const SHAPES: Array<[string, Preview3dShape]> = [
    ["Plane", Preview3dShape.Plane],
    ["Plane (hi-res)", Preview3dShape.PlaneHiRes],
    ["Cube", Preview3dShape.Cube],
    ["Cube (hi-res)", Preview3dShape.CubeHiRes],
    ["Sphere", Preview3dShape.Sphere],
];

export default function EditorEnvironmentPreviewPanel() {
    let panelSectionElement: HTMLElement;
    const renderer = useRenderEngine()!;
    const camera = new Preview3dCamera(340, 340);
    const [fullscreen, setFullscreen] = createSignal(false);
    const [loading, setLoading] = createSignal(true);

    function initialize(canvas: HTMLCanvasElement) {
        requestAnimationFrame(() => {
            renderer.set3dPreviewCanvas(canvas.transferControlToOffscreen()).then(() => {
                renderer.update3dPreviewSettingsImmediate(camera.createSettings());
                setLoading(false);
            });
        });
    }

    function onPointerDown() {
        makeDragListener((ev) => {
            const updateFn = fullscreen()
                ? renderer.update3dPreviewSettings
                : renderer.update3dPreviewSettingsImmediate;
            updateFn(camera.rotate(ev.movementX / 100, ev.movementY / 100));
        });
    }

    function onWheel(ev: WheelEvent) {
        const updateFn = fullscreen()
            ? renderer.update3dPreviewSettings
            : renderer.update3dPreviewSettingsImmediate;
        updateFn(camera.zoom(ev.deltaY > 0 ? 1.2 : 1 / 1.2));
    }

    function setShape(shape: Preview3dShape) {
        setLoading(true);
        renderer
            .update3dPreviewSettings({
                shape: get3dPreviewShapeGltf(shape),
            })
            .then(() => {
                setLoading(false);
            });
    }

    function setEnvironmentMap(map: Preview3dEnvironmentMap) {
        setLoading(true);
        renderer
            .update3dPreviewSettings({
                environmentMapUrl: get3dPreviewEnvironmentMapUrl(map),
            })
            .then(() => {
                setLoading(false);
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
            class={cn(fullscreen() ? "fixed top-0 left-0 w-full h-full z-50" : "relative")}
            label="Preview"
            titleButtons={[
                <MenuButton size="small" icon={RiOthersLightbulbFill}>
                    {ENVIRONMENT_MAPS.map(([label, value]) => (
                        <MenuButtonOption label={label} onClick={() => setEnvironmentMap(value)} />
                    ))}
                </MenuButton>,
                <MenuButton size="small" icon={RiOthersBox3Fill}>
                    {SHAPES.map(([label, value]) => (
                        <MenuButtonOption label={label} onClick={() => setShape(value)} />
                    ))}
                </MenuButton>,
                <Button icon={RiMediaFullscreenFill} size="small" onClick={toggleFullscreen} />,
            ]}
        >
            {loading() && (
                <div class="absolute top-0 left-0 w-full h-full flex items-center justify-center z-10">
                    <RiSystemLoader2Fill class="animate-spin" size={24} />
                </div>
            )}

            <canvas
                ref={(e) => onMount(() => initialize(e))}
                class="w-full touch-none"
                width="340px"
                height="340px"
                style={{ transform: "rotateX(180deg)" }}
                onPointerDown={onPointerDown}
                onWheel={onWheel}
            />
        </PanelSection>
    );
}

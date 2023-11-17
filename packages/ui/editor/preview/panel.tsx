import {
    RiMediaFullscreenFill,
    RiOthersBox3Fill,
    RiOthersLightbulbFill,
    RiSystemLoader2Fill,
    RiSystemRefreshLine,
} from "solid-icons/ri";
import { createSignal, onMount } from "solid-js";
import { useRenderEngine } from "../../../renderer/engine";
import { PreviewMode } from "../../../renderer/preview";
import {
    Preview3dEnvironmentMap,
    Preview3dShape,
    get3dPreviewEnvironmentMapUrl,
    get3dPreviewShapeGltf,
} from "../../../renderer/preview-3d";
import cn from "../../../utils/cn";
import makeDragListener from "../../../utils/makeDragListener";
import Button from "../../components/button/button";
import ButtonGroup from "../../components/button/button-group";
import MenuButton from "../../components/button/menu-button";
import MenuButtonOption from "../../components/button/menu-button-option";
import PanelSection from "../../components/panel/section";
import Preview2dCamera from "./2d-camera";
import PreviewOrbitCamera from "./orbit-camera";

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

export default function PreviewPanel() {
    let panelSectionElement: HTMLElement;
    const renderer = useRenderEngine()!;
    const orbitCamera = new PreviewOrbitCamera(340, 340);
    const camera2d = new Preview2dCamera(340, 340);
    const [fullscreen, setFullscreen] = createSignal(false);
    const [loading, setLoading] = createSignal(true);
    const [is3D, setIs3D] = createSignal(true);
    const [resetCameraVisible, setResetCameraVisible] = createSignal(false);

    function initialize(canvas: HTMLCanvasElement) {
        requestAnimationFrame(() => {
            renderer.setPreviewCanvas(canvas.transferControlToOffscreen()).then(async () => {
                await renderer.update2dPreviewSettings(camera2d.createSettings());
                await renderer.update3dPreviewSettings(orbitCamera.createSettings());
                setLoading(false);
            });
        });
    }

    function resetCamera() {
        renderer.update2dPreviewSettings(camera2d.reset());
        setResetCameraVisible(false);
    }

    function onPointerDown() {
        makeDragListener((ev) => {
            if (is3D()) {
                const updateFn = fullscreen()
                    ? renderer.update3dPreviewSettings
                    : renderer.update3dPreviewSettingsImmediate;
                updateFn(orbitCamera.rotate(ev.movementX / 100, ev.movementY / 100));
            } else {
                renderer.update2dPreviewSettings(camera2d.translate(ev.movementX, ev.movementY));
                setResetCameraVisible(true);
            }
        });
    }

    function onWheel(ev: WheelEvent) {
        if (is3D()) {
            const updateFn = fullscreen()
                ? renderer.update3dPreviewSettings
                : renderer.update3dPreviewSettingsImmediate;
            updateFn(orbitCamera.zoom(ev.deltaY > 0 ? 1.2 : 1 / 1.2));
        }
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
            renderer.update3dPreviewSettings(orbitCamera.resize(340, 340));
        } else {
            setFullscreen(true);
            renderer.update3dPreviewSettings(
                orbitCamera.resize(window.innerWidth, window.innerHeight),
            );
        }
    }

    function set2DPreviewMode() {
        setIs3D(false);
        renderer.setPreviewMode(PreviewMode.TwoD);
    }

    function set3DPreviewMode() {
        setIs3D(true);
        renderer.setPreviewMode(PreviewMode.ThreeD);
    }

    return (
        <PanelSection
            ref={panelSectionElement!}
            class={cn(fullscreen() ? "fixed top-0 left-0 w-full h-full z-50" : "relative")}
            label="Preview"
            titleButtons={[
                <ButtonGroup>
                    <Button size="small" hold={!is3D()} onClick={set2DPreviewMode}>
                        2D
                    </Button>
                    <Button size="small" hold={is3D()} onClick={set3DPreviewMode}>
                        3D
                    </Button>
                </ButtonGroup>,
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

            {!is3D() && resetCameraVisible() && (
                <div class="absolute top-12 right-0 m-3 z-10 animate-fade-in">
                    <Button size="small" icon={RiSystemRefreshLine} onClick={resetCamera} />
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

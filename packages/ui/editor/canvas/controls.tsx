import {
    RiMediaFullscreenExitFill,
    RiSystemAddFill,
    RiSystemCheckFill,
    RiSystemCloseFill,
    RiSystemSubtractFill,
} from "solid-icons/ri";
import Button from "../../components/button/button";
import ButtonGroup from "../../components/button/button-group";
import { useEditorCameraState } from "./interaction/camera";
import { useEditorSelectionManager } from "./interaction/selection";

export default function EditorCanvasControls() {
    const cameraState = useEditorCameraState()!;
    const selectionManager = useEditorSelectionManager()!;

    function renderHint(key: string, action: string) {
        return (
            <div class="text-sm">
                <span class="text-gray-700">[{key}]</span>&nbsp;
                <span class="text-gray-600">{action}</span>
            </div>
        );
    }

    return (
        <div class="absolute bottom-0 right-0 m-4 z-20 text-right flex flex-col gap-2">
            {renderHint("Hold MMB", "Pan")}
            {renderHint("Wheel", "Zoom")}
            {renderHint("Space", "Add new node")}

            <div class="flex items-center justify-end gap-2">
                <Button
                    icon={selectionManager.snapToGrid() ? RiSystemCheckFill : RiSystemCloseFill}
                    iconSide="right"
                    size="small"
                    onClick={() => selectionManager.setSnapToGrid((v) => !v)}
                >
                    Snap to grid
                </Button>

                <ButtonGroup>
                    <Button
                        icon={RiSystemSubtractFill}
                        size="small"
                        onClick={() => cameraState.zoomAtCenter(1 / 1.2)}
                    />

                    <Button
                        size="small"
                        onClick={() => cameraState.zoomAtCenter(1 / cameraState.smoothScale())}
                    >
                        {Math.round(cameraState.smoothScale() * 100)}%
                    </Button>

                    <Button
                        icon={RiSystemAddFill}
                        size="small"
                        onClick={() => cameraState.zoomAtCenter(1.2)}
                    />
                </ButtonGroup>

                <Button
                    icon={RiMediaFullscreenExitFill}
                    size="small"
                    onClick={() => cameraState.reset()}
                >
                    Center
                </Button>
            </div>
        </div>
    );
}

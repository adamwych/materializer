import { RiMediaFullscreenExitFill, RiSystemAddFill, RiSystemSubtractFill } from "solid-icons/ri";

interface Props {
    zoom: number;
    onZoomIn(): void;
    onZoomOut(): void;
    onZoomReset(): void;
    onCenter(): void;
}

export default function MaterialGraphEditorControls(props: Props) {
    return (
        <div class="absolute bottom-0 right-0 m-4 z-10 flex items-center gap-2">
            <div class="bg-gray-300 flex items-center rounded-md gap-1">
                <div
                    class="p-2 rounded-l-md hover:bg-gray-400 active:bg-gray-200"
                    onClick={props.onZoomOut}
                >
                    <RiSystemSubtractFill />
                </div>
                <span class="text-sm" onClick={props.onZoomReset}>
                    {Math.round(props.zoom * 100)}%
                </span>
                <div
                    class="p-2 rounded-r-md hover:bg-gray-400 active:bg-gray-200"
                    onClick={props.onZoomIn}
                >
                    <RiSystemAddFill />
                </div>
            </div>
            <div
                class="p-2 rounded-md flex items-center justify-center gap-2 bg-gray-300 hover:bg-gray-400 active:bg-gray-200"
                onClick={props.onCenter}
            >
                <RiMediaFullscreenExitFill />
                <span class="text-xs">Center</span>
            </div>
        </div>
    );
}

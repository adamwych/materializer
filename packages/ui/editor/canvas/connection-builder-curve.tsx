import { Show } from "solid-js";
import EditorCanvasConnectionCurve from "./connection-curve";
import { useEditorConnectionBuilder } from "./interaction/connection-builder";

export default function EditorCanvasConnectionBuilderCurve() {
    const connectionBuilder = useEditorConnectionBuilder()!;
    const info = connectionBuilder.info;

    return (
        <Show when={info()}>
            <EditorCanvasConnectionCurve
                fromCoords={[info()!.fromCoords.x, info()!.fromCoords.y]}
                toCoords={[info()!.pointerCoords.x, info()!.pointerCoords.y]}
            />
        </Show>
    );
}

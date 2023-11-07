import { Show } from "solid-js";
import EditorCanvasConnectionCurve from "./connection-curve";
import { useEditorConnectionBuilder } from "./interaction/connection-builder";

export default function EditorCanvasConnectionBuilderCurve() {
    const connectionBuilder = useEditorConnectionBuilder()!;
    const info = connectionBuilder.info;

    return (
        <Show when={info()}>
            <EditorCanvasConnectionCurve
                fromCoords={[info()!.from.x, info()!.from.y]}
                toCoords={[info()!.to.x, info()!.to.y]}
            />
        </Show>
    );
}

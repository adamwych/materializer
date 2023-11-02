import { EDITOR_GRAPH_HEIGHT, EDITOR_GRAPH_WIDTH } from "./constants";

export default function MaterialGraphEditorBackground() {
    // TODO
    return (
        <div
            class="absolute pointer-events-none"
            style={{
                width: EDITOR_GRAPH_WIDTH + "px",
                height: EDITOR_GRAPH_HEIGHT + "px",
                "background-image": "url(grid-bg.svg)",
            }}
        />
    );
}

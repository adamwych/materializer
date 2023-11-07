import { EDITOR_GRAPH_HEIGHT, EDITOR_GRAPH_WIDTH } from "../consts";

interface Props {
    fromCoords: [number, number];
    toCoords: [number, number];
}

export default function EditorCanvasConnectionCurve(props: Props) {
    const commands = () => [
        `M ${props.fromCoords[0]} ${props.fromCoords[1]}`,
        `C ${props.fromCoords[0]} ${props.fromCoords[1]},`,
        `${props.fromCoords[0] + 50} ${props.fromCoords[1]},`,
        `${props.toCoords[0]} ${props.toCoords[1]}`,
    ];

    return (
        <svg
            class="fixed top-0 left-0 z-20 pointer-events-none"
            width={EDITOR_GRAPH_WIDTH + "px"}
            height={EDITOR_GRAPH_HEIGHT + "px"}
            viewBox={`0 0 ${EDITOR_GRAPH_WIDTH}px ${EDITOR_GRAPH_HEIGHT}px`}
        >
            <path class="stroke-blue-500" d={commands().join(" ")} stroke-width="3" fill="none" />
        </svg>
    );
}

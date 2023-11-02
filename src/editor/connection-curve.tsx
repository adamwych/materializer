import { EDITOR_GRAPH_HEIGHT, EDITOR_GRAPH_WIDTH } from "./constants";

interface Props {
    fromCoords: [number, number];
    toCoords: [number, number];
}

export default function MaterialGraphNodeConnectionCurve(props: Props) {
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
            <path
                d={commands().join(" ")}
                stroke-width="3"
                stroke="var(--color-blue-500)"
                fill="none"
            />
        </svg>
    );
}

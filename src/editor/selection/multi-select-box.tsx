type Props = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export default function MaterialGraphEditorMultiselectBox(props: Props) {
    return (
        <div
            style={{
                position: "absolute",
                top: props.y + "px",
                left: props.x + "px",
                width: props.width + "px",
                height: props.height + "px",
                border: "1px solid var(--color-gray-400)",
                background: "rgba(var(--color-white-rgb), 0.1)",
                visibility: props.width + props.height === 0 ? "hidden" : "visible",
                "z-index": Number.MAX_SAFE_INTEGER,
            }}
        ></div>
    );
}

import { createEffect } from "solid-js";
import { useRenderingEngine } from "../renderer/engine.ts";

interface Props {
    nodeId: number;
    name: string;
    index: number;
    size: number;
    stacked: boolean;
}

export default function MaterialNodeBoxImage(props: Props) {
    let context: CanvasRenderingContext2D;
    const renderingEngine = useRenderingEngine()!;
    const bitmap = renderingEngine.getNodeBitmap(props.nodeId, props.name);

    createEffect(() => {
        const texture = bitmap();
        if (texture?.bitmap) {
            try {
                context?.drawImage(
                    texture.bitmap,
                    0,
                    0,
                    context.canvas.width,
                    context.canvas.height,
                );
            } catch (exception) {
                console.error(exception);
            }
        }
    });

    return (
        <canvas
            ref={(canvas) => {
                context = canvas.getContext("2d")!;
            }}
            class="absolute rounded-md"
            style={
                props.stacked
                    ? {
                          top: props.index * 24 + 12 + "px",
                          left: props.index * 24 + "px",
                          transform: "scale(0.4)",
                      }
                    : {}
            }
            width={props.size}
            height={props.size}
        ></canvas>
    );
}

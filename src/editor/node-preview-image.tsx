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
    let context: ImageBitmapRenderingContext;
    const renderingEngine = useRenderingEngine()!;
    const bitmap = renderingEngine.getNodeBitmap(props.nodeId, props.name);

    createEffect(() => {
        const texture = bitmap();
        if (texture?.bitmap) {
            try {
                context.transferFromImageBitmap(texture.bitmap);
            } catch (exception) {
                console.error(exception);
            }
        }
    });

    return (
        <canvas
            ref={(canvas) => {
                context = canvas.getContext("bitmaprenderer")!;
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

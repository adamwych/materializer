import { MaterialNodeOutputBitmap } from "../renderer/output.ts";

interface Props {
    index: number;
    size: number;
    bitmap: MaterialNodeOutputBitmap;
    stacked: boolean;
}

export default function MaterialNodeBoxImage(props: Props) {
    return (
        <canvas
            ref={(canvas) => {
                try {
                    const context = canvas.getContext("bitmaprenderer");
                    context?.transferFromImageBitmap(props.bitmap.bitmap);
                } catch (exception) {
                    console.error(exception);
                }
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

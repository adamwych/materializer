import makeDeferredDragListener from "../../../utils/makeDeferredDragListener.ts";
import { clamp, mapFrom01, mapTo01 } from "../../../utils/math.ts";
import { SliderProps } from "./props.ts";
import defaultStyles from "./styles.ts";

export default function HorizontalSlider(props: SliderProps) {
    let trackElementRef: HTMLElement | undefined;
    const styles = () => defaultStyles(props.color ?? "gray");
    const mappedValue = () => mapTo01(props.min, props.max, props.value);

    const onMouseDown = makeDeferredDragListener((ev) => {
        if (!trackElementRef) {
            return;
        }

        const trackBoundingBox = trackElementRef.getBoundingClientRect();
        let value = (ev.pageX - trackBoundingBox.x) / trackBoundingBox.width;
        value = mapFrom01(props.min, props.max, clamp(value, 0, 1));

        if (props.step) {
            value = Math.round(value / props.step) * props.step;
        }

        props.onChange(value);
    });

    return (
        <div
            ref={(e) => (trackElementRef = e)}
            class={styles().track}
            style={{
                position: "relative",
                width: "100%",
                height: styles().thickness + "px",
            }}
            onMouseDown={onMouseDown}
        >
            <div
                class={styles().handle}
                style={{
                    position: "absolute",
                    width: styles().handleSize[1] + "px",
                    height: styles().handleSize[0] + "px",
                    left: `${(mappedValue() / props.max) * 100}%`,
                    transform: `translate(-${styles().handleOffset[1]}px, -${
                        styles().handleOffset[0]
                    }px)`,
                }}
            ></div>
        </div>
    );
}
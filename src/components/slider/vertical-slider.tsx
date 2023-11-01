import makeDeferredDragListener from "../../utils/makeDeferredDragListener";
import { clamp } from "../../utils/math";
import { SliderProps } from "./props";
import defaultStyles from "./styles";

export default function VerticalSlider(props: SliderProps) {
    const styles = () => defaultStyles(props.color ?? "gray");
    let trackElementRef: HTMLElement | undefined;
    const clampedValue = () => clamp(props.value, props.min, props.max);

    const onMouseDown = makeDeferredDragListener((ev) => {
        if (!trackElementRef) {
            return;
        }

        const trackBoundingBox = trackElementRef.getBoundingClientRect();
        let value = 1 - (ev.pageY - trackBoundingBox.y) / trackBoundingBox.height;
        value = clamp(value * props.max, props.min, props.max);

        if (props.step) {
            value = Math.floor(value / props.step) * props.step;
        }

        props.onChange(value);
    });

    return (
        <div
            ref={(e) => (trackElementRef = e)}
            class={styles().track}
            style={{
                position: "relative",
                width: styles().thickness + "px",
                height: "100%",
            }}
            onMouseDown={onMouseDown}
        >
            <div
                class={styles().handle}
                style={{
                    position: "absolute",
                    width: styles().handleSize[0] + "px",
                    height: styles().handleSize[1] + "px",
                    bottom: `${(clampedValue() / props.max) * 100}%`,
                    transform: `translate(-${styles().handleOffset[0]}px, ${
                        styles().handleOffset[1]
                    }px)`,
                }}
            ></div>
        </div>
    );
}

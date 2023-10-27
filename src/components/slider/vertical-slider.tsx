import makeMouseMoveListener from "../../utils/makeMouseMoveListener";
import { clamp } from "../../utils/math";
import { SliderProps } from "./props";
import defaultStyles from "./styles";

export default function VerticalSlider(props: SliderProps) {
    const styles = () => defaultStyles(props.color ?? "gray");
    let trackElementRef: HTMLElement | undefined;
    const clampedValue = () => clamp(props.value, props.min, props.max);

    const onMouseDown = makeMouseMoveListener((ev) => {
        const trackBoundingBox = trackElementRef?.getBoundingClientRect()!;
        const value = 1 - (ev.pageY - trackBoundingBox.y) / trackBoundingBox.height;
        props.onChange(clamp(value * props.max, props.min, props.max));
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

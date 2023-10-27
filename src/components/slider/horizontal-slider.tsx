import makeMouseMoveListener from "../../utils/makeMouseMoveListener";
import { clamp } from "../../utils/math";
import { SliderProps } from "./props";
import styles from "./styles";

export default function HorizontalSlider(props: SliderProps) {
    let trackElementRef: HTMLElement | undefined;
    const clampedValue = () => clamp(props.value, props.min, props.max);

    const onMouseDown = makeMouseMoveListener((ev) => {
        const trackBoundingBox = trackElementRef?.getBoundingClientRect()!;
        const value = (ev.pageX - trackBoundingBox.x) / trackBoundingBox.width;
        props.onChange(clamp(value * props.max, props.min, props.max));
    });

    return (
        <div
            ref={(e) => (trackElementRef = e)}
            class={styles.track}
            style={{
                position: "relative",
                width: "100%",
                height: styles.thickness + "px",
            }}
            onMouseDown={onMouseDown}
        >
            <div
                class={styles.handle}
                style={{
                    position: "absolute",
                    width: styles.handleSize[1] + "px",
                    height: styles.handleSize[0] + "px",
                    left: `${(clampedValue() / props.max) * 100}%`,
                    transform: `translate(-${styles.handleOffset[1]}px, -${styles.handleOffset[0]}px)`,
                }}
            ></div>
        </div>
    );
}

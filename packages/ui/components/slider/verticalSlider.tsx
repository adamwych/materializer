import cn from "../../../utils/cn.ts";
import makeDeferredDragListener from "../../../utils/makeDeferredDragListener.ts";
import { clamp, mapFrom01, mapTo01 } from "../../../utils/math.ts";
import { SliderProps } from "./props.ts";
import defaultStyles from "./styles.ts";

export default function VerticalSlider(props: SliderProps) {
    let trackElementRef: HTMLElement | undefined;
    const styles = () => defaultStyles(props.color ?? "gray");
    const mappedValue = () => mapTo01(props.min, props.max, props.value);

    const registerDragListener = makeDeferredDragListener(
        (ev) => {
            if (!trackElementRef || props.disabled) {
                return;
            }

            const trackBoundingBox = trackElementRef.getBoundingClientRect();
            let value = 1 - (ev.pageY - trackBoundingBox.y) / trackBoundingBox.height;
            value = mapFrom01(props.min, props.max, clamp(value, 0, 1));

            if (props.step) {
                value = Math.round(value / props.step) * props.step;
                value = clamp(value, props.min, props.max);
            }

            if (value !== props.value) {
                props.onChange(value);
            }
        },
        () => {
            props.onBlur?.();
        },
    );

    function onPointerDown(ev: PointerEvent) {
        props.onFocus?.();
        registerDragListener(ev);
    }

    return (
        <div
            ref={(e) => (trackElementRef = e)}
            class={cn(styles().track, props.disabled && "pointer-events-none")}
            style={{
                position: "relative",
                width: styles().thickness + "px",
                height: "100%",
            }}
            onPointerDown={onPointerDown}
        >
            <div
                class={styles().handle}
                style={{
                    position: "absolute",
                    width: styles().handleSize[0] + "px",
                    height: styles().handleSize[1] + "px",
                    bottom: `${(mappedValue() / props.max) * 100}%`,
                    transform: `translate(-${styles().handleOffset[0] + 1}px, ${
                        styles().handleOffset[1]
                    }px)`,
                }}
            ></div>
        </div>
    );
}

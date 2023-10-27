import * as culori from "culori";
import { createEffect, createSignal } from "solid-js";
import { clamp, distance2d } from "../../utils/math";
import VerticalSlider from "../slider/vertical-slider";
import makeMouseMoveListener from "../../utils/makeMouseMoveListener";

interface Props {
    size?: number;
    value: [number, number, number];
    onChange(value: [number, number, number]): void;
}

export default function ColorWheel(props: Props) {
    let wheelElementRef: HTMLElement | undefined;
    const wheelSize = props.size ?? 256;
    const initialHSV = culori.convertRgbToHsv({
        r: props.value[0],
        g: props.value[1],
        b: props.value[2],
    });
    const [brightness, setBrightness] = createSignal(initialHSV.v);
    const [angle, setAngle] = createSignal(initialHSV.h ?? 0);
    const [distanceToCenter, setDistanceToCenter] = createSignal(initialHSV.s * (wheelSize / 2));
    const angleRadians = () => (angle() - 90) * (Math.PI / 180);
    const boxCoords = () => ({
        x: Math.cos(angleRadians()) * clamp(distanceToCenter(), 0, wheelSize / 2) + wheelSize / 2,
        y: Math.sin(angleRadians()) * clamp(distanceToCenter(), 0, wheelSize / 2) - wheelSize / 2,
    });

    createEffect(() => {
        const saturation = distanceToCenter() / (wheelSize / 2);
        const rgb = culori.convertHsvToRgb({ h: angle(), s: saturation, v: brightness() });
        props.onChange([rgb.r, rgb.g, rgb.b]);
    });

    const onMouseDown = makeMouseMoveListener((ev) => {
        const wheelBoundingBox = wheelElementRef!.getBoundingClientRect()!;
        const wheelCenter = {
            x: wheelBoundingBox.x + wheelBoundingBox.width / 2,
            y: wheelBoundingBox.y + wheelBoundingBox.height / 2,
        };

        let angle =
            Math.atan2(ev.pageY - wheelCenter.y, ev.pageX - wheelCenter.x) * (180 / Math.PI) + 90;
        if (angle < 0) {
            angle += 360;
        }

        setAngle(angle);
        setDistanceToCenter(distance2d(ev.pageX, ev.pageY, wheelCenter.x, wheelCenter.y));
    });

    return (
        <div class="flex items-center justify-center gap-8" style={{ height: wheelSize + "px" }}>
            <div class="relative">
                <div
                    ref={(e) => (wheelElementRef = e)}
                    style={{
                        width: wheelSize + "px",
                        height: wheelSize + "px",
                        background: "url(color-circle.png)",
                        "background-size": "contain",
                        "background-repeat": "no-repeat",
                        filter: `brightness(${brightness()})`,
                    }}
                    onMouseDown={onMouseDown}
                />
                <div
                    class="absolute bg-opacity-25 bg-white-0 rounded-full border border-white-0"
                    style={{
                        width: "12px",
                        height: "12px",
                        transform: `translate(${boxCoords()?.x - 6}px, ${boxCoords()?.y - 6}px)`,
                    }}
                />
            </div>

            <VerticalSlider min={0} max={1} value={brightness()} onChange={setBrightness} />
        </div>
    );
}

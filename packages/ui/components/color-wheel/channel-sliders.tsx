import { Show, createSignal } from "solid-js";
import ColorWheelHexTextInput from "./hex-text-input.tsx";
import ColorWheelHSVChannelSliders from "./hsv-channel-sliders.tsx";
import ColorWheelRGBChannelSliders from "./rgb-channel-sliders.tsx";

export default function ColorWheelChannelSliders(props: {
    value: [number, number, number];
    onChange(value: [number, number, number]): void;
    onFocus?(): void;
    onBlur?(): void;
}) {
    const [mode, setMode] = createSignal<"rgb" | "hsv">("hsv");

    function toggleMode() {
        setMode((mode) => (mode === "rgb" ? "hsv" : "rgb"));
    }

    return (
        <div class="h-full flex flex-col gap-2">
            <div class="relative flex flex-1 gap-2">
                <div
                    class="absolute -top-1 w-full text-center hover:bg-gray-500 hover:bg-opacity-20 border hover:border-gray-300 active:bg-gray-400 active:bg-opacity-20 rounded-md"
                    style={{ height: "22px" }}
                    onClick={toggleMode}
                />

                <Show when={mode() === "rgb"}>
                    <ColorWheelRGBChannelSliders
                        value={props.value}
                        onChange={props.onChange}
                        onFocus={props.onFocus}
                        onBlur={props.onBlur}
                    />
                </Show>

                <Show when={mode() === "hsv"}>
                    <ColorWheelHSVChannelSliders
                        value={props.value}
                        onChange={props.onChange}
                        onFocus={props.onFocus}
                        onBlur={props.onBlur}
                    />
                </Show>
            </div>

            <ColorWheelHexTextInput
                value={props.value}
                onChange={props.onChange}
                onFocus={props.onFocus}
                onBlur={props.onBlur}
            />
        </div>
    );
}

import HorizontalSlider from "../slider/horizontalSlider";

type Props = {
    value: number;
    onChange(value: number): void;
    onFocus(): void;
    onBlur(): void;
};

export default function GrayscaleSlider(props: Props) {
    return (
        <div class="flex items-center gap-4">
            <div>
                <svg width="100%" height="16px" viewBox="0 0 100% 16px" class="mb-3">
                    <linearGradient id="grayscaleGradient" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stop-color="black" />
                        <stop offset="100%" stop-color="white" />
                    </linearGradient>

                    <rect
                        x="0"
                        y="0"
                        rx="2"
                        ry="2"
                        width="100%"
                        height="16"
                        fill="url(#grayscaleGradient)"
                    />
                </svg>

                <HorizontalSlider
                    min={0}
                    max={1}
                    value={props.value}
                    onChange={props.onChange}
                    onPointerDown={props.onFocus}
                    onPointerUp={props.onBlur}
                />
            </div>
            <div class="w-[26px] text-center">{Math.round(props.value * 255)}</div>
        </div>
    );
}

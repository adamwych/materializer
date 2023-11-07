export type Point2D = {
    x: number;
    y: number;
};

export function clamp(value: number, min: number, max: number) {
    if (value > max) return max;
    if (value < min) return min;
    return value;
}

export function distance2d(x1: number, y1: number, x2: number, y2: number) {
    const xx = x2 - x1;
    const yy = y2 - y1;
    return Math.sqrt(xx * xx + yy * yy);
}

export function toDegrees(value: number) {
    return value * (180 / Math.PI);
}

export function toRadians(value: number) {
    return value * (Math.PI / 180);
}

export function rectIntersects(a: DOMRect, b: DOMRect) {
    return (
        Math.abs(a.x + a.width / 2 - (b.x + b.width / 2)) * 2 < a.width + b.width &&
        Math.abs(a.y + a.height / 2 - (b.y + b.height / 2)) * 2 < a.height + b.height
    );
}

/**
 * Maps given number from [min .. max] range to [0 .. 1] range.
 * @param min
 * @param max
 * @param value
 * @returns
 */
export function mapTo01(min: number, max: number, value: number) {
    return (1 / (max - min)) * (value - min) * max;
}

/**
 * Maps given number from [0 .. 1] range to [min .. max] range.
 * @param min
 * @param max
 * @param value
 * @returns
 */
export function mapFrom01(min: number, max: number, value: number) {
    return min + (max - min) * value;
}

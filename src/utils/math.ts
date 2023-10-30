export function clamp(value: number, min: number, max: number) {
    if (value > max) return max;
    if (value < min) return min;
    return value;
}

export function distance2d(x1: number, y1: number, x2: number, y2: number) {
    let xx = x2 - x1;
    let yy = y2 - y1;
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

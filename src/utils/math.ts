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

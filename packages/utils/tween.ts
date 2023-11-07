export default function tween(start: number, end: number, t: number) {
    return start + (end - start) * t;
}

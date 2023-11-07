import { TailwindColorName } from "../../../types/tailwind.ts";

export default (color: TailwindColorName) => {
    const thickness = 10;
    const handleSize = [16, 16];
    return {
        thickness,
        track: `bg-${color}-0 rounded-md border border-${color}-200`,
        handle: `bg-${color}-0 hover:bg-${color}-500 active:bg-${color}-600 border border-${color}-300 rounded-full`,
        handleSize,
        handleOffset: [(handleSize[0] - thickness) / 2, handleSize[1] / 2],
    };
};

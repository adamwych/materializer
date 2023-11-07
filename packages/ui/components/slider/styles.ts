import { TailwindColorName } from "../../../types/tailwind.ts";

export default (color: TailwindColorName) => {
    const thickness = 5;
    const handleSize = [20, 10];
    return {
        thickness,
        track: `bg-${color}-500 rounded-sm`,
        handle: `bg-${color}-700 hover:bg-${color}-800 active:bg-${color}-600 rounded-sm`,
        handleSize,
        handleOffset: [(handleSize[0] - thickness) / 2, handleSize[1] / 2],
    };
};

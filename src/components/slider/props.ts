import { TailwindColorName } from "../../types/tailwind.ts";

export type SliderProps = {
    /** Minimal value allowed by the slider. */
    min: number;

    /** Maximal value allowed by the slider. */
    max: number;

    /** Current value of the slider. */
    value: number;

    /** Color of the slider. Defaults to gray. */
    color?: TailwindColorName;

    /**
     * Called whenever the value is changed.
     * @param value New value.
     */
    onChange(value: number): void;
};

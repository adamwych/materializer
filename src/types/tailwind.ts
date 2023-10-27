import tailwindConfig from "../../tailwind.config.ts";

export type TailwindColorName = keyof typeof tailwindConfig.theme.colors;

import { PluginAPI } from "tailwindcss/types/config";

function hexToRGB(hex: string) {
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);
    return `${r}, ${g}, ${b}`;
}

function exportColorsAsCSSVariables(api: PluginAPI) {
    const properties: { [k: string]: any } = {};

    Object.entries(api.theme("colors")!).forEach(([name, values]) => {
        if (Array.isArray(values)) {
            properties[`--color-${name}`] = values[0];
            properties[`--color-${name}-contrast`] = values[1];

            if (values[0].startsWith("#")) {
                properties[`--color-${name}-rgb`] = hexToRGB(values[0]);
            }
        } else if (typeof values === "object") {
            Object.entries(values!).forEach((entry) => {
                const weight = entry[0] as unknown as number;
                const value = entry[1] as [string, string];
                properties[`--color-${name}-${weight}`] = value[0];
                properties[`--color-${name}-${weight}-contrast`] = value[1];

                if (value[0].startsWith("#")) {
                    properties[`--color-${name}-${weight}-rgb`] = hexToRGB(value[0]);
                }
            });
        } else {
            properties[`--color-${name}`] = values;
        }
    });

    api.addBase({
        ":root": properties,
    });
}

export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    safelist: [
        {
            pattern:
                /(text|bg|border)-(white|black|gray|washed-red|washed-green|washed-blue)-(100|200|300|400|500|600|700|800)/,
            variants: ["hover", "active", "group-hover"],
        },
    ],
    theme: {
        colors: {
            transparent: "transparent",
            white: ["#ffffff", "#000000"],
            black: ["#000000", "#ffffff"],
            gray: {
                0: ["#1c1c1c", "#ffffff"],
                100: ["#2c2c2c", "#ffffff"],
                200: ["#3c3c3c", "#ffffff"],
                300: ["#4c4c4c", "#ffffff"],
                400: ["#5c5c5c", "#ffffff"],
                500: ["#6c6c6c", "#ffffff"],
                600: ["#7c7c7c", "#ffffff"],
                700: ["#8c8c8c", "#ffffff"],
                800: ["#9c9c9c", "#ffffff"],
            },
            "washed-red": {
                500: ["#6e4646", "#ffffff"],
                700: ["#a46363", "#ffffff"],
                800: ["#c17878", "#ffffff"],
            },
            "washed-green": {
                500: ["#536e46", "#ffffff"],
                700: ["#64a463", "#ffffff"],
                800: ["#78c184", "#ffffff"],
            },
            "washed-blue": {
                500: ["#46556e", "#ffffff"],
                700: ["#637ea4", "#ffffff"],
                800: ["#788dc1", "#ffffff"],
            },
        },
    },
    plugins: [exportColorsAsCSSVariables],
};

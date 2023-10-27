function hexToRGB(hex) {
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);
    return `${r}, ${g}, ${b}`;
}

function exportColorsAsCSSVariables({ addBase, theme }) {
    const properties = {};

    Object.entries(theme("colors")).forEach(([name, values]) => {
        if (Array.isArray(values)) {
            properties[`--color-${name}`] = values[0];
            properties[`--color-${name}-contrast`] = values[1];

            if (values[0].startsWith("#")) {
                properties[`--color-${name}-rgb`] = hexToRGB(values[0]);
            }
        } else if (typeof values === "object") {
            Object.entries(values).forEach(([weight, value]) => {
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

    addBase({
        ":root": properties,
    });
}

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    safelist: [
        {
            pattern: /(text|bg|border)-(primary|purple|gold)-(100|200|300|400|500|600|700)/,
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
            green: {
                0: ["#00ff00", "#ffffff"],
            },
        },
    },
    plugins: [exportColorsAsCSSVariables],
};

export default {
    content: ["./index.html", "./packages/**/*.{js,ts,jsx,tsx}"],
    safelist: [
        {
            pattern:
                /(text|bg|border)-(white|black|gray|red|green|blue|washed-red|washed-green|washed-blue)-(100|200|300|400|500|600|700|800)/,
            variants: ["hover", "active", "group-hover"],
        },
    ],
    theme: {
        fontFamily: {
            sans: '"Noto Sans", Arial, Helvetica, sans-serif',
        },
        fontSize: {
            xs: "0.85rem",
            sm: "0.95rem",
            base: "1rem",
            md: "1.05rem",
            lg: "1.125rem",
            xl: "1.25rem",
        },
        extend: {
            boxShadow: {
                md: "0px 10px 40px -10px rgba(0, 0, 0, 0.5)",
            },
            zIndex: {
                dialog: "90",
                snackbars: "100",
            },
        },
        colors: {
            transparent: "transparent",
            white: "#ffffff",
            black: "#000000",
            gray: {
                0: "#1c1c1c",
                100: "#2c2c2c",
                200: "#3c3c3c",
                300: "#4c4c4c",
                400: "#5c5c5c",
                500: "#6c6c6c",
                600: "#7c7c7c",
                700: "#8c8c8c",
                800: "#9c9c9c",
            },
            blue: {
                200: "#1e4a95",
                500: "#206ded",
            },
            "washed-red": {
                500: "#6e4646",
                700: "#a46363",
                800: "#c17878",
                900: "#faacac",
            },
            "washed-green": {
                500: "#536e46",
                700: "#64a463",
                800: "#78c184",
            },
            "washed-blue": {
                500: "#46556e",
                700: "#637ea4",
                800: "#788dc1",
            },
        },
    },
};

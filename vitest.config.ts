import { defineConfig as defineViteConfig, mergeConfig } from "vite";
import { defineConfig as defineVitestConfig } from "vitest/config";
import solid from "vite-plugin-solid";

const viteConfig = defineViteConfig({
    plugins: [solid()],
    server: {
        port: 3000,
    },
    build: {
        target: "esnext",
    },
});

const vitestConfig = defineVitestConfig({
    test: {
        environment: "jsdom",
        globals: true,
        testTransformMode: { web: ["/.[jt]sx?$/"] },
    },
});

export default mergeConfig(viteConfig, vitestConfig);

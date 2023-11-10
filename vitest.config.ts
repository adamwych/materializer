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
        onConsoleLog(log, type) {
            if (type === "stderr") {
                // These errors seem like a bug inside either Solid or Vitest.
                if (
                    log.includes("You appear to have multiple instances of Solid.") ||
                    log.includes("computations created outside a `createRoot`")
                ) {
                    return false;
                }
            }

            return true as unknown as undefined;
        },
    },
});

export default mergeConfig(viteConfig, vitestConfig);

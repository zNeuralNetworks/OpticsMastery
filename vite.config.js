import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
var __dirname = path.dirname(fileURLToPath(import.meta.url));
export default defineConfig({
    esbuild: {
        jsx: "automatic",
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: function (id) {
                    if (!id.includes("node_modules")) {
                        return undefined;
                    }
                    if (id.includes("framer-motion")) {
                        return "motion-vendor";
                    }
                    if (id.includes("d3") || id.includes("recharts")) {
                        return "viz-vendor";
                    }
                    if (id.includes("react") ||
                        id.includes("react-dom") ||
                        id.includes("react-router-dom") ||
                        id.includes("lucide-react")) {
                        return "core-vendor";
                    }
                    return undefined;
                },
            },
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    test: {
        environment: "node",
        include: ["src/**/*.test.ts"],
    },
});

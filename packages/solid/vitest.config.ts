import { defineConfig } from "vitest/config";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "solid-js",
  },
  test: {
    environment: "happy-dom",
  },
});
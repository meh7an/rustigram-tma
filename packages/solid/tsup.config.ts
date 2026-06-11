import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  sourcemap: true,
  clean: true,
  external: ["solid-js", "@rustigram/tma-core"],
  dts: {
    compilerOptions: {
      ignoreDeprecations: "6.0",
    },
  },
  esbuildOptions(options) {
    // Solid uses the automatic JSX runtime via solid-js/jsx-runtime
    options.jsx = "automatic";
    options.jsxImportSource = "solid-js";
  },
});

import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "solidstart/index": "src/solidstart/index.ts",
  },
  format: ["esm", "cjs"],
  sourcemap: true,
  clean: true,
  external: ["@rustigram/tma-core", "@solidjs/start"],
  dts: {
    compilerOptions: {
      ignoreDeprecations: "6.0",
    },
  },
});

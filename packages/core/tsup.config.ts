import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "mock/index": "src/mock/index.ts",
  },
  format: ["esm", "cjs"],
  sourcemap: true,
  clean: true,
  dts: {
    compilerOptions: {
      ignoreDeprecations: "6.0",
    },
  },
});

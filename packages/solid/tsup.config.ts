import { readFileSync } from "fs";
import { transformSync } from "@babel/core";
import { defineConfig } from "tsup";
import type { Plugin } from "esbuild";

// Compiles Solid JSX via babel-preset-solid instead of esbuild's automatic
// JSX transform. babel-preset-solid outputs template/createComponent calls
// that have zero dependency on solid-js/jsx-runtime, avoiding Vite's
// pre-bundler CJS conversion stripping the jsx export.
function solidBabelPlugin(): Plugin {
  return {
    name: "solid-jsx",
    setup(build) {
      build.onLoad({ filter: /\.[jt]sx$/ }, (args) => {
        const source = readFileSync(args.path, "utf-8");
        const result = transformSync(source, {
          filename: args.path,
          presets: [
            "babel-preset-solid",
            ["@babel/preset-typescript", { allExtensions: true, isTSX: true }],
          ],
          sourceMaps: false,
        });
        if (!result?.code) {
          throw new Error(`[solid-babel] empty output for ${args.path}`);
        }
        return { contents: result.code, loader: "js" };
      });
    },
  };
}

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: {
    compilerOptions: { ignoreDeprecations: "6.0" },
  },
  sourcemap: true,
  clean: true,
  external: ["solid-js", "@rustigram/tma-core"],
  // esbuildOptions with jsx: "automatic" removed — babel handles it above
  esbuildPlugins: [solidBabelPlugin()],
});
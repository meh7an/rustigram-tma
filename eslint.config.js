import tseslint from "typescript-eslint";
import solid from "eslint-plugin-solid";

export default tseslint.config(
  ...tseslint.configs.recommended,
  {
    plugins: { solid },
    rules: {
      // Solid-specific: destructuring props kills reactivity
      "solid/no-destructure": "error",
      "solid/reactivity": "warn",
    },
    files: ["**/*.tsx"],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
  },
  {
    rules: {
      // Enforce the no-any rule from our style guide
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/.output/**",
      "**/.solid/**",
    ],
  },
);

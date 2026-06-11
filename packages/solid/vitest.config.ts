import { defineConfig } from "vitest/config";

// vite-plugin-solid + @solidjs/testing-library are added in M4.1
// when actual component tests are written.
export default defineConfig({
  test: {
    name: "solid",
    environment: "jsdom",
  },
});

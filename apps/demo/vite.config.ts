import { solidStart } from "@solidjs/start/config";
import { defineConfig } from "vite";
export default defineConfig({
  plugins: [
    solidStart({
      ssr: false,
      middleware: "./src/middleware.ts",
    }),
  ],
  server: {
    allowedHosts: true,
  }
});
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  test: {
    // The default forks pool fails on Windows/Node 24 in this project (worker state is
    // undefined at describe, so every suite errors with "reading 'config'"). vmForks works.
    pool: "vmForks",
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
    globals: true,
    css: true,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});

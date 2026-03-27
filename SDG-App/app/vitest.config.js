import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/tests/setupTests.js",
    include: ["src/tests/**/*.test.jsx"],
    globals: true,
    css: true,
  },
});
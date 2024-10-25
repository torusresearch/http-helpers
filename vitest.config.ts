// eslint-disable-next-line import/no-unresolved
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Add any Vitest-specific configurations here
    globals: true,
    environment: "node",
    watch: false,
  },
});

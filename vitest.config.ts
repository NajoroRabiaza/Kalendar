import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include:     ["lib/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include:  ["lib/**/*.ts"],
      exclude:  [
        "lib/**/*.test.ts",
        "lib/**/*.d.ts",
        "lib/injectStyles.ts",
      ],
    },
  },
});

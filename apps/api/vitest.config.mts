import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["**/*.unit.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          include: ["**/*.integration.test.ts"],
          globalSetup: ["./test/integration-setup/global-setup.ts"],
          setupFiles: ["./test/integration-setup/test-setup.ts"],
          // Single worker for database safety: prevents race conditions,
          // ensures deterministic test execution, and maintains transaction isolation
          pool: "threads",
          poolOptions: {
            threads: {
              singleThread: true,
            },
          },
        },
      },
    ],
    exclude: ["build/**", "node_modules/**"],
  },
});

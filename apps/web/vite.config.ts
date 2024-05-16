import { defineConfig } from "vite";
import { resolve } from "path";
import { readFileSync } from "fs";
import react from "@vitejs/plugin-react";
import eslint from "vite-plugin-eslint";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    eslint({
      exclude: ["../../packages/**/*.ts"],
    }),
  ],
  server: {
    host: "app.sweetr.local",
    https:
      process.env.NODE_ENV === "development"
        ? {
            key: readFileSync(resolve(__dirname, "../../certs/tls.key")),
            cert: readFileSync(resolve(__dirname, "../../certs/tls.cert")),
          }
        : undefined,
  },
});

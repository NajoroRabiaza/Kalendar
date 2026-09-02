import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

export default defineConfig({
  plugins: [
    react({ jsxRuntime: "automatic" }),
  ],

  publicDir: false,

  build: {
    lib: {
      entry:   resolve(__dirname, "lib/index.js"),
      name:    "Kalendar",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format}.js`,
    },

    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "@fullcalendar/react",
        "@fullcalendar/daygrid",
        "@fullcalendar/timegrid",
        "@fullcalendar/google-calendar",
        "@fullcalendar/core",
        "@fullcalendar/core/locales/fr",
        "@fullcalendar/core/locales/en-gb",
      ],
      output: {
        exports: "named",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "style.css") return "kalendar.css";
          return assetInfo.name;
        },
      },
    },

    outDir: "dist",
    sourcemap: true,
    emptyOutDir: true,
    minify: false,
  },
});
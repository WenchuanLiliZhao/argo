import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { defineConfig } from "vite";

/**
 * Vite may emit `crossorigin` on script/link tags. With Electron's `file://` origin that
 * triggers module/CORS rules and the main bundle often fails to run (blank or broken UI).
 * Strip for production HTML intended to load via `BrowserWindow.loadFile`.
 */
function electronProductionHtml(): Plugin {
  return {
    name: "electron-production-html",
    apply: "build",
    enforce: "post",
    transformIndexHtml(html) {
      return html
        .replace(/\s+crossorigin(?:="[^"]*")?/g, "")
        .replace(/\s+integrity="[^"]*"/g, "");
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), electronProductionHtml()],
  base: "./",
  // Must match app/electron/main.ts dev URL and npm run dev wait-on. If 5173 is
  // taken, Vite must fail (not auto-switch port) or Electron would load the wrong origin.
  server: {
    // Bind IPv4 explicitly so wait-on/tcp and Electron match (avoids ::1-only localhost).
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
  },
});

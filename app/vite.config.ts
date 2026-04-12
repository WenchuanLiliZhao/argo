import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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

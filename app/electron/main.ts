import { app, BrowserWindow } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isDev =
  process.env.NODE_ENV === "development" || !app.isPackaged;

/** Smallest size the user can resize the window to (CSS pixels). */
const MIN_WIDTH = 800;
const MIN_HEIGHT = 600;

function createWindow(): void {
  const win = new BrowserWindow({
    width: 960,
    height: 640,
    minWidth: MIN_WIDTH,
    minHeight: MIN_HEIGHT,
    /** Match the renderer so the chrome does not flash a different color on launch. */
    backgroundColor: "#ffffff",
    /**
     * macOS: hide the separate title bar so the window looks like one surface (like many
     * modern apps). Traffic lights stay in the top-left; the page must pad the top and
     * expose a drag region — see `App.tsx` / `App.css`.
     */
    /**
     * Use `hidden` (not `hiddenInset`) so renderer `app-region: drag` works reliably on
     * macOS — `hiddenInset` reserves a native title strip that often breaks CSS drag.
     */
    ...(process.platform === "darwin" && {
      titleBarStyle: "hidden",
      trafficLightPosition: { x: 16, y: 14 },
    }),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      /** Production: block DevTools and shortcuts (e.g. ⌘⌥I / ⌘⌥J / ⌘⌥C on macOS). */
      devTools: isDev,
    },
  });

  if (isDev) {
    void win.loadURL("http://127.0.0.1:5173");
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    void win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

void app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

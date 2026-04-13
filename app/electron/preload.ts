import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("argo", {
  platform: process.platform,
});

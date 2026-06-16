import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { rethrowAsArgoError } from "../shared/errors.js";

type AppSettings = {
  lastWorkspacePath: string | null;
};

const DEFAULT_SETTINGS: AppSettings = {
  lastWorkspacePath: null,
};

export class RecentWorkspaceStore {
  constructor(private readonly settingsPath: string) {}

  static forUserData(userDataPath: string): RecentWorkspaceStore {
    return new RecentWorkspaceStore(path.join(userDataPath, "argo-settings.json"));
  }

  async getRecent(): Promise<string | null> {
    const settings = await this.read();
    return settings.lastWorkspacePath;
  }

  async setRecent(workspacePath: string | null): Promise<void> {
    await this.write({ lastWorkspacePath: workspacePath });
  }

  private async read(): Promise<AppSettings> {
    try {
      const raw = await readFile(this.settingsPath, "utf8");
      const parsed: unknown = JSON.parse(raw);
      if (!isAppSettings(parsed)) {
        return DEFAULT_SETTINGS;
      }
      return parsed;
    } catch (err) {
      const nodeErr = err as NodeJS.ErrnoException;
      if (nodeErr.code === "ENOENT" || err instanceof SyntaxError) {
        return DEFAULT_SETTINGS;
      }
      rethrowAsArgoError(
        err,
        "IO_ERROR",
        `Failed to read app settings at ${this.settingsPath}`,
      );
    }
  }

  private async write(settings: AppSettings): Promise<void> {
    try {
      await writeFile(
        this.settingsPath,
        `${JSON.stringify(settings, null, 2)}\n`,
        "utf8",
      );
    } catch (err) {
      rethrowAsArgoError(
        err,
        "IO_ERROR",
        `Failed to write app settings at ${this.settingsPath}`,
      );
    }
  }
}

function isAppSettings(value: unknown): value is AppSettings {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const pathValue = (value as AppSettings).lastWorkspacePath;
  return pathValue === null || typeof pathValue === "string";
}

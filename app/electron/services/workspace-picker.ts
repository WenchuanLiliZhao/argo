import { access } from "node:fs/promises";
import path from "node:path";
import { type BrowserWindow, dialog } from "electron";
import { ArgoError } from "../shared/errors.js";
import type { WorkspaceMeta } from "../shared/types.js";
import type { RecentWorkspaceStore } from "./recent-workspace-store.js";
import type { WorkspaceService } from "./workspace-service.js";

export type WorkspaceSession = {
  meta: WorkspaceMeta;
  path: string;
  created: boolean;
};

export type RestoreRecentResult =
  | { status: "none" }
  | ({ status: "ok" } & WorkspaceSession)
  | { status: "failed"; path: string; message: string };

export class WorkspacePicker {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly recentStore: RecentWorkspaceStore,
  ) {}

  async pickAndOpen(parent: BrowserWindow | null): Promise<WorkspaceSession | null> {
    const workspacePath = await this.pickDirectory(
      parent,
      "Open Workspace",
      "Choose a folder for your workspace",
    );
    if (!workspacePath) {
      return null;
    }
    return this.openPath(workspacePath);
  }

  async pickAndCreate(parent: BrowserWindow | null): Promise<WorkspaceSession | null> {
    const workspacePath = await this.pickDirectory(
      parent,
      "New Workspace",
      "Choose an empty folder for a new workspace",
    );
    if (!workspacePath) {
      return null;
    }

    if (await this.pathExists(this.workspaceService.getArgoDir(workspacePath))) {
      throw new ArgoError(
        "WORKSPACE_INVALID",
        "This folder already contains a workspace. Use Open Workspace instead.",
      );
    }

    const name = path.basename(workspacePath);
    const meta = await this.workspaceService.create(workspacePath, name);
    await this.recentStore.setRecent(workspacePath);
    return { meta, path: workspacePath, created: true };
  }

  async openPath(workspacePath: string): Promise<WorkspaceSession> {
    const hasWorkspace = await this.pathExists(
      this.workspaceService.getArgoDir(workspacePath),
    );

    if (hasWorkspace) {
      const meta = await this.workspaceService.open(workspacePath);
      await this.recentStore.setRecent(workspacePath);
      return { meta, path: workspacePath, created: false };
    }

    const name = path.basename(workspacePath);
    const meta = await this.workspaceService.create(workspacePath, name);
    await this.recentStore.setRecent(workspacePath);
    return { meta, path: workspacePath, created: true };
  }

  async restoreRecent(): Promise<RestoreRecentResult> {
    const recentPath = await this.recentStore.getRecent();
    if (!recentPath) {
      return { status: "none" };
    }

    try {
      const session = await this.openPath(recentPath);
      return { status: "ok", ...session };
    } catch (err) {
      await this.recentStore.setRecent(null);
      const message = err instanceof Error ? err.message : String(err);
      return { status: "failed", path: recentPath, message };
    }
  }

  private async pickDirectory(
    parent: BrowserWindow | null,
    title: string,
    message: string,
  ): Promise<string | null> {
    const result = parent
      ? await dialog.showOpenDialog(parent, {
          title,
          message,
          properties: ["openDirectory", "createDirectory"],
        })
      : await dialog.showOpenDialog({
          title,
          message,
          properties: ["openDirectory", "createDirectory"],
        });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    return result.filePaths[0] ?? null;
  }

  private async pathExists(targetPath: string): Promise<boolean> {
    try {
      await access(targetPath);
      return true;
    } catch {
      return false;
    }
  }
}

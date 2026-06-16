import { BrowserWindow, ipcMain, type IpcMainInvokeEvent } from "electron";
import { ArgoError } from "../shared/errors.js";
import type { IssueStore } from "../services/issue-store.js";
import type { RecentWorkspaceStore } from "../services/recent-workspace-store.js";
import type { WorkspacePicker } from "../services/workspace-picker.js";
import type { WorkspaceService } from "../services/workspace-service.js";
import type {
  CreateIssueInput,
  UpdateIssuePatch,
} from "../shared/types.js";

function propagateIpcError(err: unknown): never {
  if (err instanceof ArgoError) {
    const error = new Error(err.message) as Error & { code: string };
    error.code = err.code;
    throw error;
  }
  throw err;
}

async function handle<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    propagateIpcError(err);
  }
}

function parentWindow(event: IpcMainInvokeEvent): BrowserWindow | null {
  return BrowserWindow.fromWebContents(event.sender);
}

export function registerIpcHandlers(
  workspaceService: WorkspaceService,
  issueStore: IssueStore,
  workspacePicker: WorkspacePicker,
  recentStore: RecentWorkspaceStore,
): void {
  ipcMain.handle("argo:workspace:create", (_event, workspacePath: string, name: string) =>
    handle(() => workspaceService.create(workspacePath, name)),
  );

  ipcMain.handle("argo:workspace:open", (_event, workspacePath: string) =>
    handle(() => workspaceService.open(workspacePath)),
  );

  ipcMain.handle("argo:workspace:getCurrent", () =>
    handle(async () => workspaceService.getCurrent()),
  );

  ipcMain.handle("argo:workspace:getCurrentPath", () =>
    handle(async () => workspaceService.getCurrentPath()),
  );

  ipcMain.handle("argo:workspace:getRecent", () =>
    handle(() => recentStore.getRecent()),
  );

  ipcMain.handle("argo:workspace:restoreRecent", () =>
    handle(() => workspacePicker.restoreRecent()),
  );

  ipcMain.handle("argo:workspace:pickAndOpen", (event) =>
    handle(() => workspacePicker.pickAndOpen(parentWindow(event))),
  );

  ipcMain.handle("argo:workspace:pickAndCreate", (event) =>
    handle(() => workspacePicker.pickAndCreate(parentWindow(event))),
  );

  ipcMain.handle("argo:issues:list", () => handle(() => issueStore.list()));

  ipcMain.handle("argo:issues:get", (_event, id: string) =>
    handle(() => issueStore.get(id)),
  );

  ipcMain.handle("argo:issues:create", (_event, input: CreateIssueInput) =>
    handle(() => issueStore.create(input)),
  );

  ipcMain.handle("argo:issues:update", (_event, id: string, patch: UpdateIssuePatch) =>
    handle(() => issueStore.update(id, patch)),
  );

  ipcMain.handle("argo:issues:delete", (_event, id: string) =>
    handle(() => issueStore.delete(id)),
  );
}

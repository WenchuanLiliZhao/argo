import { contextBridge, ipcRenderer } from "electron";
import type {
  CreateIssueInput,
  Issue,
  IssueSummary,
  UpdateIssuePatch,
  WorkspaceMeta,
} from "./shared/types.js";

type WorkspaceSession = {
  meta: WorkspaceMeta;
  path: string;
  created: boolean;
};

type RestoreRecentResult =
  | { status: "none" }
  | ({ status: "ok" } & WorkspaceSession)
  | { status: "failed"; path: string; message: string };

const argo = {
  workspace: {
    create: (workspacePath: string, name: string): Promise<WorkspaceMeta> =>
      ipcRenderer.invoke("argo:workspace:create", workspacePath, name),
    open: (workspacePath: string): Promise<WorkspaceMeta> =>
      ipcRenderer.invoke("argo:workspace:open", workspacePath),
    getCurrent: (): Promise<WorkspaceMeta | null> =>
      ipcRenderer.invoke("argo:workspace:getCurrent"),
    getCurrentPath: (): Promise<string | null> =>
      ipcRenderer.invoke("argo:workspace:getCurrentPath"),
    getRecent: (): Promise<string | null> =>
      ipcRenderer.invoke("argo:workspace:getRecent"),
    restoreRecent: (): Promise<RestoreRecentResult> =>
      ipcRenderer.invoke("argo:workspace:restoreRecent"),
    pickAndOpen: (): Promise<WorkspaceSession | null> =>
      ipcRenderer.invoke("argo:workspace:pickAndOpen"),
    pickAndCreate: (): Promise<WorkspaceSession | null> =>
      ipcRenderer.invoke("argo:workspace:pickAndCreate"),
  },
  issues: {
    list: (): Promise<IssueSummary[]> => ipcRenderer.invoke("argo:issues:list"),
    get: (id: string): Promise<Issue> =>
      ipcRenderer.invoke("argo:issues:get", id),
    create: (input: CreateIssueInput): Promise<Issue> =>
      ipcRenderer.invoke("argo:issues:create", input),
    update: (id: string, patch: UpdateIssuePatch): Promise<Issue> =>
      ipcRenderer.invoke("argo:issues:update", id, patch),
    delete: (id: string): Promise<void> =>
      ipcRenderer.invoke("argo:issues:delete", id),
  },
};

contextBridge.exposeInMainWorld("argo", argo);

/// <reference types="vite/client" />

type IssueStatus = "backlog" | "todo" | "in-progress" | "done";
type TriageStatus =
  | "needs-triage"
  | "needs-info"
  | "ready-for-agent"
  | "ready-for-human"
  | "wontfix";

type WorkspaceMeta = {
  version: 1;
  name: string;
  issuePrefix: string;
  nextIssueNumber: number;
  columns: IssueStatus[];
  createdAt: string;
  openedAt: string;
};

type WorkspaceSession = {
  meta: WorkspaceMeta;
  path: string;
  created: boolean;
};

type RestoreRecentResult =
  | { status: "none" }
  | ({ status: "ok" } & WorkspaceSession)
  | { status: "failed"; path: string; message: string };

type IssueSummary = {
  id: string;
  title: string;
  status: IssueStatus;
  triage: TriageStatus;
  labels: string[];
  updatedAt: string;
  body: string;
};

type Issue = IssueSummary & {
  createdAt: string;
};

type CreateIssueInput = {
  title: string;
  status?: IssueStatus;
  triage?: TriageStatus;
  labels?: string[];
  body?: string;
};

type UpdateIssuePatch = {
  title?: string;
  status?: IssueStatus;
  triage?: TriageStatus;
  labels?: string[];
  body?: string;
};

type ArgoErrorCode =
  | "WORKSPACE_NOT_FOUND"
  | "WORKSPACE_INVALID"
  | "ISSUE_NOT_FOUND"
  | "IO_ERROR"
  | "NO_WORKSPACE_OPEN";

type ArgoAPI = {
  workspace: {
    create: (workspacePath: string, name: string) => Promise<WorkspaceMeta>;
    open: (workspacePath: string) => Promise<WorkspaceMeta>;
    getCurrent: () => Promise<WorkspaceMeta | null>;
    getCurrentPath: () => Promise<string | null>;
    getRecent: () => Promise<string | null>;
    restoreRecent: () => Promise<RestoreRecentResult>;
    pickAndOpen: () => Promise<WorkspaceSession | null>;
    pickAndCreate: () => Promise<WorkspaceSession | null>;
  };
  issues: {
    list: () => Promise<IssueSummary[]>;
    get: (id: string) => Promise<Issue>;
    create: (input: CreateIssueInput) => Promise<Issue>;
    update: (id: string, patch: UpdateIssuePatch) => Promise<Issue>;
    delete: (id: string) => Promise<void>;
  };
};

declare global {
  interface Window {
    argo: ArgoAPI;
  }

  interface Error {
    code?: ArgoErrorCode;
  }
}

export type { RestoreRecentResult, WorkspaceMeta, WorkspaceSession };

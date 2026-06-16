export type WorkspaceMeta = {
  version: 1;
  name: string;
  issuePrefix: string;
  nextIssueNumber: number;
  columns: Array<"backlog" | "todo" | "in-progress" | "done">;
  createdAt: string;
  openedAt: string;
};

export type WorkspaceSession = {
  meta: WorkspaceMeta;
  path: string;
  created: boolean;
};

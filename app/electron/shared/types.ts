export type IssueStatus = "backlog" | "todo" | "in-progress" | "done";

export type TriageStatus =
  | "needs-triage"
  | "needs-info"
  | "ready-for-agent"
  | "ready-for-human"
  | "wontfix";

export type WorkspaceMeta = {
  version: 1;
  name: string;
  issuePrefix: string;
  nextIssueNumber: number;
  columns: IssueStatus[];
  createdAt: string;
  openedAt: string;
};

export type IssueFrontmatter = {
  id: string;
  title: string;
  status: IssueStatus;
  triage: TriageStatus;
  labels: string[];
  createdAt: string;
  updatedAt: string;
};

export type IssueSummary = Pick<
  IssueFrontmatter,
  "id" | "title" | "status" | "triage" | "labels" | "updatedAt"
> & { body: string };

export type Issue = IssueFrontmatter & { body: string };

export type CreateIssueInput = {
  title: string;
  status?: IssueStatus;
  triage?: TriageStatus;
  labels?: string[];
  body?: string;
};

export type UpdateIssuePatch = {
  title?: string;
  status?: IssueStatus;
  triage?: TriageStatus;
  labels?: string[];
  body?: string;
};

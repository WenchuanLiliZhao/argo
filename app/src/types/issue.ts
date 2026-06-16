export type IssueStatus = "backlog" | "todo" | "in-progress" | "done";

export type TriageStatus =
  | "needs-triage"
  | "needs-info"
  | "ready-for-agent"
  | "ready-for-human"
  | "wontfix";

export type IssueSummary = {
  id: string;
  title: string;
  status: IssueStatus;
  triage: TriageStatus;
  labels: string[];
  updatedAt: string;
  body: string;
};

export type Issue = IssueSummary & {
  createdAt: string;
};

export type UpdateIssuePatch = {
  title?: string;
  status?: IssueStatus;
  triage?: TriageStatus;
  labels?: string[];
  body?: string;
};

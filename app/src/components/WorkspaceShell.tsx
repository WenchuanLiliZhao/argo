import { useCallback } from "react";
import { IssuePanel } from "./IssuePanel";
import type { WorkspaceViewState } from "../hooks/useWorkspaceSession";

type WorkspaceShellProps = {
  workspace: WorkspaceViewState;
  actionError: string | null;
  onSwitchWorkspace: () => void;
  onDismissActionError: () => void;
  onIssueError: (message: string) => void;
};

export function WorkspaceShell({
  workspace,
  actionError,
  onSwitchWorkspace,
  onDismissActionError,
  onIssueError,
}: WorkspaceShellProps) {
  const handleIssueError = useCallback(
    (message: string) => {
      onIssueError(message);
    },
    [onIssueError],
  );

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-title">
          <span className="app-name">Argo</span>
          <span className="workspace-name">{workspace.meta.name}</span>
        </div>
        <div className="topbar-path" title={workspace.path}>
          {workspace.path}
        </div>
        <button type="button" className="topbar-action" onClick={onSwitchWorkspace}>
          Switch Workspace…
        </button>
      </header>

      {actionError ? (
        <p className="banner banner-error shell-banner" role="alert">
          {actionError}
          <button
            type="button"
            className="banner-dismiss"
            onClick={onDismissActionError}
          >
            Dismiss
          </button>
        </p>
      ) : null}

      <main className="shell-main">
        <IssuePanel columns={workspace.meta.columns} onError={handleIssueError} />
      </main>
    </div>
  );
}

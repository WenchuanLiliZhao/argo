type WelcomeViewProps = {
  restoreError: string | null;
  actionError: string | null;
  onOpenWorkspace: () => void;
  onCreateWorkspace: () => void;
  onDismissActionError: () => void;
};

export function WelcomeView({
  restoreError,
  actionError,
  onOpenWorkspace,
  onCreateWorkspace,
  onDismissActionError,
}: WelcomeViewProps) {
  return (
    <main className="welcome">
      <div className="welcome-card">
        <h1>Argo</h1>
        <p className="welcome-lead">
          Open a local folder to use it as your offline issue workspace.
        </p>

        {restoreError ? (
          <p className="banner banner-warning" role="alert">
            {restoreError}
          </p>
        ) : null}

        {actionError ? (
          <p className="banner banner-error" role="alert">
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

        <div className="welcome-actions">
          <button type="button" className="primary" onClick={onOpenWorkspace}>
            Open Workspace…
          </button>
          <button type="button" onClick={onCreateWorkspace}>
            New Workspace…
          </button>
        </div>

        <p className="welcome-hint">
          Choose a folder on disk. Argo stores issues in a <code>.argo/</code>{" "}
          directory inside that folder.
        </p>
      </div>
    </main>
  );
}

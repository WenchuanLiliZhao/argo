import { WorkspaceShell } from "./components/WorkspaceShell";
import { WelcomeView } from "./components/WelcomeView";
import { useWorkspaceSession } from "./hooks/useWorkspaceSession";
import "./App.css";

function App() {
  const {
    loading,
    workspace,
    restoreError,
    actionError,
    openWorkspace,
    createWorkspace,
    switchWorkspace,
    clearActionError,
    setIssueError,
  } = useWorkspaceSession();

  if (loading) {
    return (
      <main className="loading">
        <p>Loading workspace…</p>
      </main>
    );
  }

  if (!workspace) {
    return (
      <WelcomeView
        restoreError={restoreError}
        actionError={actionError}
        onOpenWorkspace={() => void openWorkspace()}
        onCreateWorkspace={() => void createWorkspace()}
        onDismissActionError={clearActionError}
      />
    );
  }

  return (
    <WorkspaceShell
      workspace={workspace}
      actionError={actionError}
      onSwitchWorkspace={() => void switchWorkspace()}
      onDismissActionError={clearActionError}
      onIssueError={setIssueError}
    />
  );
}

export default App;

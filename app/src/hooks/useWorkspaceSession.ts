import { useCallback, useEffect, useState } from "react";
import type { WorkspaceMeta } from "../types/workspace";
import { formatArgoError } from "../lib/argo-error";

export type WorkspaceViewState = {
  meta: WorkspaceMeta;
  path: string;
};

type UseWorkspaceSessionResult = {
  loading: boolean;
  workspace: WorkspaceViewState | null;
  restoreError: string | null;
  actionError: string | null;
  openWorkspace: () => Promise<void>;
  createWorkspace: () => Promise<void>;
  switchWorkspace: () => Promise<void>;
  clearActionError: () => void;
  setIssueError: (message: string) => void;
};

export function useWorkspaceSession(): UseWorkspaceSessionResult {
  const [loading, setLoading] = useState(true);
  const [workspace, setWorkspace] = useState<WorkspaceViewState | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const applySession = useCallback(
    (session: { meta: WorkspaceMeta; path: string }) => {
      setWorkspace({ meta: session.meta, path: session.path });
      setRestoreError(null);
      setActionError(null);
    },
    [],
  );

  const restoreOnLaunch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await window.argo.workspace.restoreRecent();
      if (result.status === "ok") {
        applySession(result);
      } else if (result.status === "failed") {
        setWorkspace(null);
        setRestoreError(
          `Could not reopen ${result.path}: ${result.message}`,
        );
      } else {
        setWorkspace(null);
      }
    } catch (err) {
      setWorkspace(null);
      setRestoreError(formatArgoError(err));
    } finally {
      setLoading(false);
    }
  }, [applySession]);

  useEffect(() => {
    void restoreOnLaunch();
  }, [restoreOnLaunch]);

  const runPicker = useCallback(
    async (mode: "open" | "create") => {
      setActionError(null);
      try {
        const session =
          mode === "open"
            ? await window.argo.workspace.pickAndOpen()
            : await window.argo.workspace.pickAndCreate();
        if (session) {
          applySession(session);
        }
      } catch (err) {
        setActionError(formatArgoError(err));
      }
    },
    [applySession],
  );

  const openWorkspace = useCallback(
    () => runPicker("open"),
    [runPicker],
  );

  const createWorkspace = useCallback(
    () => runPicker("create"),
    [runPicker],
  );

  const switchWorkspace = useCallback(
    () => runPicker("open"),
    [runPicker],
  );

  const clearActionError = useCallback(() => {
    setActionError(null);
  }, []);

  const setIssueError = useCallback((message: string) => {
    setActionError(message);
  }, []);

  return {
    loading,
    workspace,
    restoreError,
    actionError,
    openWorkspace,
    createWorkspace,
    switchWorkspace,
    clearActionError,
    setIssueError,
  };
}

import { useCallback, useEffect, useState } from "react";
import { formatArgoError } from "../lib/argo-error";
import { sortIssuesDescending } from "../lib/issue-body";
import type { Issue, IssueSummary, UpdateIssuePatch } from "../types/issue";

type UseIssuesResult = {
  issues: IssueSummary[];
  selectedId: string | null;
  selectedIssue: Issue | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  selectIssue: (id: string) => void;
  createIssue: () => Promise<void>;
  updateIssue: (patch: UpdateIssuePatch) => Promise<void>;
  updateIssueById: (id: string, patch: UpdateIssuePatch) => Promise<void>;
  deleteIssue: () => Promise<void>;
  clearError: () => void;
};

export function useIssues(): UseIssuesResult {
  const [issues, setIssues] = useState<IssueSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshList = useCallback(async () => {
    const list = await window.argo.issues.list();
    setIssues(sortIssuesDescending(list));
  }, []);

  const loadSelectedIssue = useCallback(async (id: string) => {
    const issue = await window.argo.issues.get(id);
    setSelectedIssue(issue);
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await window.argo.issues.list();
        if (cancelled) {
          return;
        }
        const sorted = sortIssuesDescending(list);
        setIssues(sorted);
        if (sorted.length > 0) {
          const firstId = sorted[0].id;
          setSelectedId(firstId);
          const issue = await window.argo.issues.get(firstId);
          if (!cancelled) {
            setSelectedIssue(issue);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(formatArgoError(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectIssue = useCallback(
    (id: string) => {
      setSelectedId(id);
      setError(null);
      void loadSelectedIssue(id).catch((err: unknown) => {
        setError(formatArgoError(err));
      });
    },
    [loadSelectedIssue],
  );

  const createIssue = useCallback(async () => {
    setError(null);
    try {
      const issue = await window.argo.issues.create({ title: "Untitled issue" });
      await refreshList();
      setSelectedId(issue.id);
      setSelectedIssue(issue);
    } catch (err) {
      setError(formatArgoError(err));
    }
  }, [refreshList]);

  const updateIssueById = useCallback(
    async (id: string, patch: UpdateIssuePatch) => {
      setSaving(true);
      setError(null);
      try {
        const updated = await window.argo.issues.update(id, patch);
        if (id === selectedId) {
          setSelectedIssue(updated);
        }
        await refreshList();
      } catch (err) {
        setError(formatArgoError(err));
      } finally {
        setSaving(false);
      }
    },
    [refreshList, selectedId],
  );

  const updateIssue = useCallback(
    async (patch: UpdateIssuePatch) => {
      if (!selectedId) {
        return;
      }
      await updateIssueById(selectedId, patch);
    },
    [selectedId, updateIssueById],
  );

  const deleteIssue = useCallback(async () => {
    if (!selectedId || !selectedIssue) {
      return;
    }

    const confirmed = window.confirm(
      `Delete ${selectedIssue.id}: ${selectedIssue.title}?`,
    );
    if (!confirmed) {
      return;
    }

    setError(null);
    const remaining = issues.filter((issue) => issue.id !== selectedId);
    const nextSelectedId = remaining[0]?.id ?? null;

    try {
      await window.argo.issues.delete(selectedId);
      setIssues(remaining);
      setSelectedId(nextSelectedId);
      if (nextSelectedId) {
        await loadSelectedIssue(nextSelectedId);
      } else {
        setSelectedIssue(null);
      }
    } catch (err) {
      setError(formatArgoError(err));
      await refreshList();
    }
  }, [issues, loadSelectedIssue, refreshList, selectedId, selectedIssue]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    issues,
    selectedId,
    selectedIssue,
    loading,
    saving,
    error,
    selectIssue,
    createIssue,
    updateIssue,
    updateIssueById,
    deleteIssue,
    clearError,
  };
}

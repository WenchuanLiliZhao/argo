import { useCallback, useEffect, useState } from "react";
import { IssueDetail } from "./IssueDetail";
import { IssueFilters } from "./IssueFilters";
import { IssueList } from "./IssueList";
import { KanbanBoard } from "./KanbanBoard";
import { ViewModeToggle } from "./ViewModeToggle";
import { useIssueFilters } from "../hooks/useIssueFilters";
import { useIssues } from "../hooks/useIssues";
import type { IssueViewMode } from "./ViewModeToggle";
import type { IssueStatus } from "../types/issue";

type IssuePanelProps = {
  columns: IssueStatus[];
  onError: (message: string) => void;
};

export function IssuePanel({ columns, onError }: IssuePanelProps) {
  const [viewMode, setViewMode] = useState<IssueViewMode>("list");
  const [issueDirty, setIssueDirty] = useState(false);
  const {
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
  } = useIssues();

  const {
    query,
    setQuery,
    statuses,
    toggleStatus,
    triages,
    toggleTriage,
    labels,
    toggleLabel,
    availableLabels,
    filteredIssues,
    filtersActive,
    clearFilters,
  } = useIssueFilters(issues);

  const handleSelectIssue = useCallback(
    (id: string) => {
      if (id === selectedId) {
        return;
      }
      if (issueDirty) {
        const discard = window.confirm(
          "You have unsaved changes. Discard them and switch issues?",
        );
        if (!discard) {
          return;
        }
      }
      selectIssue(id);
    },
    [issueDirty, selectIssue, selectedId],
  );

  useEffect(() => {
    if (!error) {
      return;
    }
    onError(error);
    clearError();
  }, [clearError, error, onError]);

  useEffect(() => {
    if (filteredIssues.length === 0) {
      return;
    }
    if (selectedId && filteredIssues.some((issue) => issue.id === selectedId)) {
      return;
    }
    if (issueDirty) {
      return;
    }
    selectIssue(filteredIssues[0].id);
  }, [filteredIssues, issueDirty, selectIssue, selectedId]);

  if (loading) {
    return (
      <div className="issue-workspace issue-workspace-loading">
        <p>Loading issues…</p>
      </div>
    );
  }

  const selectedVisible =
    selectedId !== null &&
    (filteredIssues.some((issue) => issue.id === selectedId) || issueDirty);

  return (
    <div className="issue-workspace">
      <div
        className={
          viewMode === "list"
            ? "issue-primary issue-primary-list"
            : "issue-primary issue-primary-board"
        }
      >
        <div className="issue-toolbar">
          <ViewModeToggle mode={viewMode} onChange={setViewMode} />
          <button
            type="button"
            className="primary"
            onClick={() => void createIssue()}
          >
            New Issue
          </button>
        </div>

        <IssueFilters
          query={query}
          onQueryChange={setQuery}
          statuses={statuses}
          onToggleStatus={toggleStatus}
          triages={triages}
          onToggleTriage={toggleTriage}
          labels={labels}
          availableLabels={availableLabels}
          onToggleLabel={toggleLabel}
          filtersActive={filtersActive}
          onClearFilters={clearFilters}
        />

        {viewMode === "list" ? (
          <IssueList
            issues={filteredIssues}
            selectedId={selectedId}
            onSelect={handleSelectIssue}
            totalCount={issues.length}
          />
        ) : (
          <KanbanBoard
            columns={columns}
            issues={filteredIssues}
            selectedId={selectedId}
            onSelect={handleSelectIssue}
            onStatusChange={(id, status) => {
              void updateIssueById(id, { status });
            }}
          />
        )}
      </div>

      <div className="issue-detail-pane">
        {selectedIssue && selectedVisible ? (
          <IssueDetail
            issue={selectedIssue}
            saving={saving}
            onUpdate={updateIssue}
            onDelete={() => void deleteIssue()}
            onDirtyChange={setIssueDirty}
          />
        ) : filteredIssues.length === 0 && filtersActive ? (
          <div className="issue-detail-empty">
            <h2>No matching issues</h2>
            <p>Try a different search or clear your filters.</p>
          </div>
        ) : (
          <div className="issue-detail-empty">
            <h2>Select an issue</h2>
            <p>Choose an issue from the list or board, or create a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
}

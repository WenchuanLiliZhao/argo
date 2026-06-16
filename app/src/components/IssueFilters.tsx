import { ISSUE_STATUS_OPTIONS } from "../lib/issue-status";
import { TRIAGE_STATUS_OPTIONS } from "../lib/triage-status";
import type { IssueStatus, TriageStatus } from "../types/issue";

type IssueFiltersProps = {
  query: string;
  onQueryChange: (query: string) => void;
  statuses: IssueStatus[];
  onToggleStatus: (status: IssueStatus) => void;
  triages: TriageStatus[];
  onToggleTriage: (triage: TriageStatus) => void;
  labels: string[];
  availableLabels: string[];
  onToggleLabel: (label: string) => void;
  filtersActive: boolean;
  onClearFilters: () => void;
};

export function IssueFilters({
  query,
  onQueryChange,
  statuses,
  onToggleStatus,
  triages,
  onToggleTriage,
  labels,
  availableLabels,
  onToggleLabel,
  filtersActive,
  onClearFilters,
}: IssueFiltersProps) {
  return (
    <div className="issue-filters">
      <input
        className="issue-search"
        type="search"
        placeholder="Search issues…"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        spellCheck={false}
      />

      <div className="filter-group">
        <span className="filter-group-label">Status</span>
        <div className="filter-chips">
          {ISSUE_STATUS_OPTIONS.map((option) => {
            const active = statuses.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                className={active ? "filter-chip filter-chip-active" : "filter-chip"}
                aria-pressed={active}
                onClick={() => onToggleStatus(option.value)}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-group-label">Triage</span>
        <div className="filter-chips">
          {TRIAGE_STATUS_OPTIONS.map((option) => {
            const active = triages.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                className={active ? "filter-chip filter-chip-active" : "filter-chip"}
                aria-pressed={active}
                onClick={() => onToggleTriage(option.value)}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {availableLabels.length > 0 ? (
        <div className="filter-group">
          <span className="filter-group-label">Labels</span>
          <div className="filter-chips">
            {availableLabels.map((label) => {
              const active = labels.includes(label);
              return (
                <button
                  key={label}
                  type="button"
                  className={active ? "filter-chip filter-chip-active" : "filter-chip"}
                  aria-pressed={active}
                  onClick={() => onToggleLabel(label)}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {filtersActive ? (
        <button type="button" className="filter-clear" onClick={onClearFilters}>
          Clear filters
        </button>
      ) : null}
    </div>
  );
}

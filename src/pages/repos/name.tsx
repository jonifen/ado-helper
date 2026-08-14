import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useSettingsStore } from "../../data/settings-store.js";
import { useRepoStore } from "../../data/repo-store.js";
import { generateCommitsCsv } from "../../utils/commits-csv.js";
import { RepoReadme } from "../../components/repo-readme.js";

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function startOfDay(dateInputValue: string): Date {
  const date = new Date(dateInputValue);
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfDay(dateInputValue: string): Date {
  const date = new Date(dateInputValue);
  date.setHours(23, 59, 59, 999);
  return date;
}

function stripRefsHeadsPrefix(branch: string): string {
  return branch.replace(/^refs\/heads\//, "");
}

type TabKey = "readme" | "commits";

export function RepoDetail() {
  const { name } = useParams<{ name: string }>();
  const { pat, organisation, project } = useSettingsStore((state) => state);
  const {
    repository,
    loading,
    error,
    commits,
    loadingCommits,
    commitsError,
    readme,
    loadingReadme,
    readmeError,
    loadRepository,
    loadCommits,
    loadReadme,
  } = useRepoStore((state) => state);

  const [activeTab, setActiveTab] = useState<TabKey>("readme");

  const defaultFromInput = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return toDateInputValue(date);
  }, []);
  const defaultToInput = useMemo(() => toDateInputValue(new Date()), []);

  const [fromInput, setFromInput] = useState(defaultFromInput);
  const [toInput, setToInput] = useState(defaultToInput);
  const [branchInput, setBranchInput] = useState("");
  // Tracks the branch actually used for the currently-loaded `commits`
  // (as opposed to branchInput, which may have unapplied edits), so the
  // CSV export reflects reality even if the user typed a new branch but
  // hasn't clicked Apply yet.
  const [appliedBranch, setAppliedBranch] = useState("");

  useEffect(() => {
    if (!name) return;
    loadRepository(name);
  }, [name]);

  useEffect(() => {
    if (!repository) return;
    const branch = repository.defaultBranch
      ? stripRefsHeadsPrefix(repository.defaultBranch)
      : "";
    setBranchInput(branch);
    setAppliedBranch(branch);
    loadCommits(startOfDay(fromInput), endOfDay(toInput), branch || undefined);
    loadReadme(branch || undefined);
    // Only re-run when a *new* repository loads — date-range/branch changes
    // are applied explicitly via the form below, not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repository]);

  useEffect(() => {
    if (!repository) return;
    document.title = `${repository.name} (ADO Helper)`;
    return () => {
      document.title = "ADO Helper";
    };
  }, [repository]);

  const handleApplyBranch = (event: React.FormEvent) => {
    event.preventDefault();
    const branch = branchInput.trim();
    setAppliedBranch(branch);
    loadCommits(startOfDay(fromInput), endOfDay(toInput), branch || undefined);
    loadReadme(branch || undefined);
  };

  const handleApplyRange = (event: React.FormEvent) => {
    event.preventDefault();
    loadCommits(
      startOfDay(fromInput),
      endOfDay(toInput),
      appliedBranch || undefined,
    );
  };

  const handleExportCsv = () => {
    if (!repository) return;
    const csv = generateCommitsCsv(commits, repository.name, appliedBranch);
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = `commits-${repository.name}-${fromInput}-to-${toInput}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!pat || !organisation || !project) {
    return (
      <div className="font-sans items-center justify-items-center min-h-screen px-8 py-3">
        <p>
          Please go to the Settings page and enter your Personal Access Token,
          Organisation, and Project to use this tool.
        </p>
      </div>
    );
  }

  if (!name) return <div>No repository name provided.</div>;

  if (loading)
    return (
      <div className="font-sans items-center justify-items-center min-h-screen px-8 py-3">
        Loading
      </div>
    );

  if (error)
    return (
      <div className="font-sans items-center justify-items-center min-h-screen px-8 py-3">
        <p className="text-red-500">
          Error loading repository "{name}": {error}
        </p>
      </div>
    );

  if (!repository) return null;

  return (
    <div className="font-sans items-center justify-items-center min-h-screen px-8 pb-3">
      <div className="flex flex-col gap-3 max-w-full">
        <div>
          <h2 className="text-2xl font-bold">{repository.name}</h2>
          {repository.webUrl && (
            <a
              href={repository.webUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm underline"
            >
              Open in Azure DevOps ↗
            </a>
          )}
        </div>

        <form
          onSubmit={handleApplyBranch}
          className="flex flex-row gap-2 items-end"
        >
          <div>
            <label className="block text-xs text-gray-400">Branch</label>
            <input
              type="text"
              value={branchInput}
              onChange={(event) => setBranchInput(event.target.value)}
              placeholder="e.g. main"
              className="border border-slate-600 p-2 w-40"
            />
          </div>
          <button
            type="submit"
            className="px-2 py-1 border border-[#9CCB69] text-[#9CCB69] text-sm rounded hover:bg-[#9CCB69] hover:text-black transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#9CCB69]"
          >
            Apply
          </button>
        </form>

        <div className="flex flex-row gap-2 border-b border-[#33373C]">
          <button
            type="button"
            onClick={() => setActiveTab("readme")}
            className={
              activeTab === "readme"
                ? "px-3 py-1 text-sm font-bold text-[#9BCF69] border-b-2 border-[#9BCF69]"
                : "px-3 py-1 text-sm text-gray-400"
            }
          >
            Readme
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("commits")}
            className={
              activeTab === "commits"
                ? "px-3 py-1 text-sm font-bold text-[#9BCF69] border-b-2 border-[#9BCF69]"
                : "px-3 py-1 text-sm text-gray-400"
            }
          >
            Commits
          </button>
        </div>

        {activeTab === "readme" && (
          <RepoReadme
            markdown={readme}
            loading={loadingReadme}
            error={readmeError}
          />
        )}

        {activeTab === "commits" && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-row">
            <form
              onSubmit={handleApplyRange}
              className="flex-1 flex flex-row gap-2 items-end"
            >
              <div>
                <label className="block text-xs text-gray-400">From</label>
                <input
                  type="date"
                  value={fromInput}
                  onChange={(event) => setFromInput(event.target.value)}
                  className="border border-slate-600 p-2"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400">To</label>
                <input
                  type="date"
                  value={toInput}
                  onChange={(event) => setToInput(event.target.value)}
                  className="border border-slate-600 p-2"
                />
              </div>
              <button
                type="submit"
                className="px-2 py-1 border border-[#9CCB69] text-[#9CCB69] text-sm rounded hover:bg-[#9CCB69] hover:text-black transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#9CCB69]"
              >
                Apply
              </button>
            </form>
            {!loadingCommits && !commitsError && commits.length > 0 && (
                <div className="flex-0 min-w-32 text-right valign-bottom">
                  <p>Export options</p>
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="px-2 py-1 border border-[#9CCB69] text-[#9CCB69] text-sm rounded hover:bg-[#9CCB69] hover:text-black transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#9CCB69]"
                  >
                    CSV
                  </button>
                </div>
                )}
            </div>

            {loadingCommits && <div className="text-sm">Loading commits</div>}

            {!loadingCommits && commitsError && (
              <p className="text-sm text-red-500">
                Error loading commits: {commitsError}
              </p>
            )}

            {!loadingCommits && !commitsError && commits.length === 0 && (
              <i className="text-sm">No commits found in this date range</i>
            )}

            {!loadingCommits && !commitsError && commits.length > 0 && (
              <>
                <div className="flex flex-col gap-2">
                  {commits.map((commit) => (
                    <div
                      key={commit.commitId}
                      className="border-1 border-[#33373C] rounded-md bg-[#33373C] shadow-md p-2 text-sm"
                    >
                      <div className="flex flex-row gap-2 items-baseline">
                        <a
                          href={commit.remoteUrl || commit.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-gray-400 underline text-nowrap"
                        >
                          {commit.commitId.slice(0, 8)}
                        </a>
                        <div className="flex-1">{commit.comment}</div>
                        <div className="text-xs text-gray-400 text-nowrap">
                          {commit.author?.name}
                          {commit.author?.date && (
                            <>
                              {" "}
                              &middot;{" "}
                              {new Date(commit.author.date).toLocaleString()}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import type { GitCommitRefType } from "../data/api/repos-types.js";

export function getCommitTitle(comment: string): string {
  return (comment || "").split("\n")[0] || "";
}

function escapeCsvValue(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export function generateCommitsCsv(
  commits: GitCommitRefType[],
  repositoryName: string,
  branch: string,
): string {
  const headers = ["Repository", "Branch", "Id", "Developer", "Date", "Comment", "URL"];
  const rows = commits.map((commit) => [
    repositoryName,
    branch,
    commit.commitId,
    commit.author?.name || "",
    commit.author?.date ? new Date(commit.author.date).toISOString() : "",
    getCommitTitle(commit.comment),
    commit.remoteUrl || commit.url || "",
  ]);

  return [headers, ...rows]
    .map((row) => row.map((value) => escapeCsvValue(String(value))).join(","))
    .join("\n");
}

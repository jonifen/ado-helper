import { describe, it, expect } from "vitest";
import { generateCommitsCsv, getCommitTitle } from "./commits-csv.js";
import type { GitCommitRefType } from "../data/api/repos-types.js";

describe("getCommitTitle", () => {
  it("returns just the first line of a multi-line commit message", () => {
    expect(getCommitTitle("Fix the thing\n\nLonger body text here")).toBe(
      "Fix the thing",
    );
  });

  it("returns the whole message when it's a single line", () => {
    expect(getCommitTitle("Fix the thing")).toBe("Fix the thing");
  });
});

describe("generateCommitsCsv", () => {
  it("produces a header row and one row per commit with the requested columns", () => {
    const commits: GitCommitRefType[] = [
      {
        commitId: "abc123def456",
        author: { name: "Alice", email: "alice@example.com", date: "2026-01-01T00:00:00Z" },
        committer: { name: "Bob", email: "bob@example.com", date: "2026-01-01T00:00:00Z" },
        comment: "Fix the thing\n\nDetails here",
        url: "https://dev.azure.com/org/project/_apis/git/repositories/repo/commits/abc123def456",
        remoteUrl: "https://dev.azure.com/org/project/_git/repo/commit/abc123def456",
      },
    ];

    const csv = generateCommitsCsv(commits, "my-repo", "main");
    const lines = csv.split("\n");

    expect(lines[0]).toBe('"Repository","Branch","Id","Developer","Date","Comment","URL"');
    expect(lines[1]).toBe(
      '"my-repo","main","abc123def456","Alice","2026-01-01T00:00:00.000Z","Fix the thing","https://dev.azure.com/org/project/_git/repo/commit/abc123def456"',
    );
  });

  it("escapes embedded quotes in commit messages", () => {
    const commits: GitCommitRefType[] = [
      {
        commitId: "abc123",
        author: { name: "Alice", email: "a@example.com", date: "2026-01-01T00:00:00Z" },
        committer: { name: "Alice", email: "a@example.com", date: "2026-01-01T00:00:00Z" },
        comment: 'Say "hello" to the world',
        url: "https://example.com/commit/abc123",
      },
    ];

    const csv = generateCommitsCsv(commits, "my-repo", "main");
    expect(csv).toContain('"Say ""hello"" to the world"');
  });

  it("returns just the header row when there are no commits", () => {
    expect(generateCommitsCsv([], "my-repo", "main")).toBe(
      '"Repository","Branch","Id","Developer","Date","Comment","URL"',
    );
  });
});

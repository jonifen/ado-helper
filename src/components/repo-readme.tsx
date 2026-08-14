import React from "react";
import { marked } from "marked";

export function RepoReadme({
  markdown,
  loading,
  error,
}: {
  markdown: string | null;
  loading: boolean;
  error: string | null;
}) {
  if (loading) return <div className="text-sm">Loading README</div>;

  if (error || !markdown) {
    return <i className="text-sm">No README.md found in this repository</i>;
  }

  const html = marked.parse(markdown) as string;

  return (
    <div
      className="markdown-body border-1 border-[#33373C] rounded-md bg-[#33373C] shadow-md p-4 text-sm"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

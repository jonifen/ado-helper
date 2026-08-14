export type GitRepositoryType = {
  id: string;
  name: string;
  url: string;
  webUrl?: string;
  defaultBranch?: string;
  project: { id: string; name: string };
};

export type GitCommitAuthorType = {
  name: string;
  email: string;
  date: string;
};

export type GitCommitRefType = {
  commitId: string;
  author: GitCommitAuthorType;
  committer: GitCommitAuthorType;
  comment: string;
  commentTruncated?: boolean;
  url: string;
  remoteUrl?: string;
};

export type GitCommitsResponseType = {
  count: number;
  value: GitCommitRefType[];
};

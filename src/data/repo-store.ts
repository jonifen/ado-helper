import { create } from "zustand";
import {
  getRepository,
  getRepositoryCommits,
  getRepositoryReadme,
} from "./api/repos.js";
import type { GitCommitRefType, GitRepositoryType } from "./api/repos-types.js";

type RepoStoreType = {
  repository: GitRepositoryType | null;
  commits: GitCommitRefType[];
  readme: string | null;
  loading: boolean;
  loadingCommits: boolean;
  loadingReadme: boolean;
  error: string | null;
  commitsError: string | null;
  readmeError: string | null;
  loadRepository: (name: string) => Promise<void>;
  loadCommits: (fromDate: Date, toDate: Date, branch?: string) => Promise<void>;
  loadReadme: (branch?: string) => Promise<void>;
};

export const useRepoStore = create<RepoStoreType>()((set, get) => ({
  repository: null,
  commits: [],
  readme: null,
  loading: false,
  loadingCommits: false,
  loadingReadme: false,
  error: null,
  commitsError: null,
  readmeError: null,
  loadRepository: async (name: string) => {
    set(() => ({
      loading: true,
      error: null,
      repository: null,
      commits: [],
      commitsError: null,
      readme: null,
      readmeError: null,
    }));
    try {
      const repository = await getRepository(name);
      set(() => ({ repository, loading: false }));
    } catch (error) {
      set(() => ({
        repository: null,
        loading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }));
    }
  },
  loadCommits: async (fromDate: Date, toDate: Date, branch?: string) => {
    const { repository } = get();
    if (!repository) return;

    set(() => ({ loadingCommits: true, commitsError: null }));
    try {
      const commits = await getRepositoryCommits(
        repository.id,
        fromDate,
        toDate,
        branch,
      );
      set(() => ({ commits, loadingCommits: false }));
    } catch (error) {
      set(() => ({
        commits: [],
        loadingCommits: false,
        commitsError: error instanceof Error ? error.message : "Unknown error",
      }));
    }
  },
  loadReadme: async (branch?: string) => {
    const { repository } = get();
    if (!repository) return;

    set(() => ({ loadingReadme: true, readmeError: null }));
    try {
      const readme = await getRepositoryReadme(repository.id, branch);
      set(() => ({ readme, loadingReadme: false }));
    } catch (error) {
      set(() => ({
        readme: null,
        loadingReadme: false,
        readmeError: error instanceof Error ? error.message : "Unknown error",
      }));
    }
  },
}));

import { getDevOpsData, getDevOpsText } from "./ado-client.js";
import { useSettingsStore } from "../settings-store.js";
import type {
  GitCommitRefType,
  GitCommitsResponseType,
  GitRepositoryType,
} from "./repos-types.js";

export async function getRepository(
  nameOrId: string,
): Promise<GitRepositoryType> {
  const { organisation, project } = useSettingsStore.getState();
  const url = `https://dev.azure.com/${organisation}/${project}/_apis/git/repositories/${encodeURIComponent(nameOrId)}?api-version=7.1`;
  return await getDevOpsData<GitRepositoryType>(url);
}

export async function getRepositoryReadme(
  repositoryId: string,
  branch?: string,
): Promise<string> {
  const { organisation, project } = useSettingsStore.getState();
  const branchParams = branch
    ? `&versionDescriptor.versionType=branch&versionDescriptor.version=${encodeURIComponent(branch)}`
    : "";
  const url =
    `https://dev.azure.com/${organisation}/${project}/_apis/git/repositories/${repositoryId}/items` +
    `?path=/README.md${branchParams}&api-version=7.1`;
  return await getDevOpsText(url);
}

const COMMITS_PAGE_SIZE = 100;

export async function getRepositoryCommits(
  repositoryId: string,
  fromDate: Date,
  toDate: Date,
  branch?: string,
): Promise<GitCommitRefType[]> {
  const { organisation, project } = useSettingsStore.getState();
  const allCommits: GitCommitRefType[] = [];
  let skip = 0;

  const branchParams = branch
    ? `&searchCriteria.itemVersion.versionType=branch&searchCriteria.itemVersion.version=${encodeURIComponent(branch)}`
    : "";

  while (true) {
    const url =
      `https://dev.azure.com/${organisation}/${project}/_apis/git/repositories/${repositoryId}/commits` +
      `?searchCriteria.fromDate=${encodeURIComponent(fromDate.toISOString())}` +
      `&searchCriteria.toDate=${encodeURIComponent(toDate.toISOString())}` +
      `&searchCriteria.$top=${COMMITS_PAGE_SIZE}` +
      `&searchCriteria.$skip=${skip}` +
      branchParams +
      `&api-version=7.1`;
    const data = await getDevOpsData<GitCommitsResponseType>(url);
    allCommits.push(...data.value);

    if (data.value.length < COMMITS_PAGE_SIZE) break;
    skip += COMMITS_PAGE_SIZE;
  }

  return allCommits;
}

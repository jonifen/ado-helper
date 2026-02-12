import { getDevOpsData } from "./ado-client.js";
import type { GetTeamsType, GetTeamType } from "./teams-types.js";
import { useSettingsStore } from "../settings-store.js";

export async function getTeams(): Promise<GetTeamsType> {
  const { organisation, project } = useSettingsStore.getState();
  return await getDevOpsData<GetTeamsType>(
    `https://dev.azure.com/${organisation}/_apis/projects/${project}/teams?api-version=7.1`,
  );
}

export async function getTeam(teamId: string): Promise<GetTeamType> {
  const { organisation, project } = useSettingsStore.getState();
  return await getDevOpsData<GetTeamType>(
    `https://dev.azure.com/${organisation}/_apis/projects/${project}/teams/${teamId}?api-version=7.1`,
  );
}

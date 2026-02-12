import { getDevOpsData } from "./ado-client.js";
import { useSettingsStore } from "../settings-store.js";
import type { SprintCapacityType, TeamDaysOffType } from "./capacity-types.js";

export async function getSprintCapacity(
  teamId: string,
  iterationId: string,
): Promise<SprintCapacityType> {
  const { organisation, project } = useSettingsStore.getState();
  return await getDevOpsData<SprintCapacityType>(
    `https://dev.azure.com/${organisation}/${project}/${teamId}/_apis/work/teamsettings/iterations/${iterationId}/capacities?api-version=7.1`,
  );
}

export async function getTeamDaysOff(
  teamId: string,
  iterationId: string,
): Promise<TeamDaysOffType> {
  const { organisation, project } = useSettingsStore.getState();
  return await getDevOpsData<TeamDaysOffType>(
    `https://dev.azure.com/${organisation}/${project}/${teamId}/_apis/work/teamsettings/iterations/${iterationId}/teamdaysoff?api-version=7.1`,
  );
}

import { getDevOpsData } from "./ado-client.js";
import { useSettingsStore } from "../settings-store.js";
import type {
  IterationsType,
  IterationsValueType,
  IterationType,
} from "./iterations-types.js";

export async function getIteration(
  teamId: string,
  iterationId: string,
): Promise<IterationsValueType> {
  const { organisation, project } = useSettingsStore.getState();
  return await getDevOpsData<IterationsValueType>(
    `https://dev.azure.com/${organisation}/${project}/${teamId}/_apis/work/teamsettings/iterations/${iterationId}?api-version=7.1`,
  );
}

export async function getIterationWorkItems(
  teamId: string,
  iterationId: string,
): Promise<IterationType> {
  const { organisation, project } = useSettingsStore.getState();
  return await getDevOpsData<IterationType>(
    `https://dev.azure.com/${organisation}/${project}/${teamId}/_apis/work/teamsettings/iterations/${iterationId}/workitems?api-version=7.1`,
  );
}

export async function getIterations(teamId: string): Promise<IterationsType> {
  const { organisation, project } = useSettingsStore.getState();
  return await getDevOpsData<IterationsType>(
    `https://dev.azure.com/${organisation}/${project}/${teamId}/_apis/work/teamsettings/iterations?api-version=7.1`,
  );
}

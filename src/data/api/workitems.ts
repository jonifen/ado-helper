import { getDevOpsData, postDevOpsData } from "./ado-client.js";
import { useSettingsStore } from "../settings-store.js";
import type {
  WorkItemResponseType,
  WorkItemRevisionType,
  WorkItemUpdateType,
} from "./workitems-types.js";

export async function getWorkItemsByIds(
  workItemIds: number[],
): Promise<WorkItemResponseType> {
  const { organisation, project } = useSettingsStore.getState();
  const body = JSON.stringify({
    ids: [...workItemIds],
    fields: [
      "System.Id",
      "System.Title",
      "System.WorkItemType",
      "System.AssignedTo",
      "System.State",
      "System.Parent",
      "System.CreatedDate",
      "System.Tags",
      "Microsoft.VSTS.Scheduling.StoryPoints",
      "Microsoft.VSTS.Scheduling.OriginalEstimate",
      "Microsoft.VSTS.Scheduling.RemainingWork",
      "Microsoft.VSTS.Scheduling.CompletedWork",
    ],
  });

  return await postDevOpsData<WorkItemResponseType>(
    `https://dev.azure.com/${organisation}/${project}/_apis/wit/workitemsbatch?api-version=7.1`,
    body,
  );
}

export async function getWorkItemRevisions(
  workItemId: number,
): Promise<WorkItemRevisionType[]> {
  const { organisation, project } = useSettingsStore.getState();
  const url = `https://dev.azure.com/${organisation}/${project}/_apis/wit/workItems/${workItemId}/revisions?api-version=7.1`;
  const data = await getDevOpsData<{ value: WorkItemRevisionType[] }>(url);
  return data.value;
}

export async function getWorkItemUpdates(
  workItemId: number,
): Promise<WorkItemUpdateType[]> {
  const { organisation, project } = useSettingsStore.getState();
  const url = `https://dev.azure.com/${organisation}/${project}/_apis/wit/workItems/${workItemId}/updates?api-version=7.1`;
  const data = await getDevOpsData<{ value: WorkItemUpdateType[] }>(url);
  return data.value;
}

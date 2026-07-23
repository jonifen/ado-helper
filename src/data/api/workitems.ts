import { getDevOpsData, postDevOpsData } from "./ado-client.js";
import { useSettingsStore } from "../settings-store.js";
import type {
  WorkItemCommentsResponseType,
  WorkItemCommentType,
  WorkItemDataType,
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

export async function getWorkItemById(
  workItemId: number,
): Promise<WorkItemDataType> {
  const { organisation, project } = useSettingsStore.getState();
  const url = `https://dev.azure.com/${organisation}/${project}/_apis/wit/workitems/${workItemId}?$expand=all&api-version=7.1`;
  return await getDevOpsData<WorkItemDataType>(url);
}

export async function getWorkItemComments(
  workItemId: number,
): Promise<WorkItemCommentType[]> {
  const { organisation, project } = useSettingsStore.getState();
  const url = `https://dev.azure.com/${organisation}/${project}/_apis/wit/workItems/${workItemId}/comments?api-version=7.1-preview`;
  const data = await getDevOpsData<WorkItemCommentsResponseType>(url);
  return data.comments;
}

export async function getWorkItemRevisions(
  workItemId: number,
): Promise<WorkItemRevisionType[]> {
  const { organisation, project } = useSettingsStore.getState();
  const url = `https://dev.azure.com/${organisation}/${project}/_apis/wit/workItems/${workItemId}/revisions?api-version=7.1`;
  const data = await getDevOpsData<{ value: WorkItemRevisionType[] }>(url);
  return data.value;
}

const UPDATES_PAGE_SIZE = 200;

export async function getWorkItemUpdates(
  workItemId: number,
): Promise<WorkItemUpdateType[]> {
  const { organisation, project } = useSettingsStore.getState();
  const allUpdates: WorkItemUpdateType[] = [];
  let skip = 0;

  // The updates endpoint pages its results — without $top/$skip it only
  // returns the first 200 revisions, silently dropping the rest. Keep
  // paging until a page comes back shorter than the requested size.
  while (true) {
    const url = `https://dev.azure.com/${organisation}/${project}/_apis/wit/workItems/${workItemId}/updates?$top=${UPDATES_PAGE_SIZE}&$skip=${skip}&api-version=7.1`;
    const data = await getDevOpsData<{ value: WorkItemUpdateType[] }>(url);
    allUpdates.push(...data.value);

    if (data.value.length < UPDATES_PAGE_SIZE) break;
    skip += UPDATES_PAGE_SIZE;
  }

  return allUpdates;
}

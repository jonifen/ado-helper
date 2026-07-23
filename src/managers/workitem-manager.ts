import {
  getWorkItemById,
  getWorkItemComments,
  getWorkItemsByIds,
  getWorkItemUpdates,
} from "../data/api/workitems.js";
import type {
  WorkItemCommentType,
  WorkItemDataType,
} from "../data/api/workitems-types.js";
import type {
  WorkItemCommentDetailType,
  WorkItemDetailType,
  WorkItemSummaryType,
  WorkItemTimelineType,
} from "./workitem-manager-types.js";
import { getStateTransitions } from "../utils/state-transitions.js";

const PARENT_REL = "System.LinkTypes.Hierarchy-Reverse";
const CHILD_REL = "System.LinkTypes.Hierarchy-Forward";

function getIdFromRelationUrl(url: string): number {
  return Number(url.substring(url.lastIndexOf("/") + 1));
}

function mapComment(comment: WorkItemCommentType): WorkItemCommentDetailType {
  return {
    id: comment.id,
    author: comment.createdBy?.displayName || "Unknown",
    createdDate: new Date(comment.createdDate),
    html: comment.text || "",
  };
}

function mapWorkItemSummary(workItem: WorkItemDataType): WorkItemSummaryType {
  return {
    id: workItem.fields["System.Id"],
    title: workItem.fields["System.Title"],
    type: workItem.fields["System.WorkItemType"],
    state: workItem.fields["System.State"],
    assignedTo: workItem.fields["System.AssignedTo"]?.displayName || "",
    points: workItem.fields["Microsoft.VSTS.Scheduling.StoryPoints"],
    originalEstimate:
      workItem.fields["Microsoft.VSTS.Scheduling.OriginalEstimate"],
    remaining: workItem.fields["Microsoft.VSTS.Scheduling.RemainingWork"],
    completed: workItem.fields["Microsoft.VSTS.Scheduling.CompletedWork"],
  };
}

export async function getWorkItemDetail(
  workItemId: number,
): Promise<WorkItemDetailType> {
  const workItem = await getWorkItemById(workItemId);
  const relations = workItem.relations || [];

  const parentId = relations.find((relation) => relation.rel === PARENT_REL)
    ? getIdFromRelationUrl(
        relations.find((relation) => relation.rel === PARENT_REL)!.url,
      )
    : null;
  const childIds = relations
    .filter((relation) => relation.rel === CHILD_REL)
    .map((relation) => getIdFromRelationUrl(relation.url));

  const relatedIds = [...(parentId ? [parentId] : []), ...childIds];
  const [relatedWorkItems, comments, updates] = await Promise.all([
    relatedIds.length ? getWorkItemsByIds(relatedIds) : { count: 0, value: [] },
    getWorkItemComments(workItemId),
    getWorkItemUpdates(workItemId),
  ]);

  const timeline: WorkItemTimelineType = {
    createdDate: workItem.fields["System.CreatedDate"]
      ? new Date(workItem.fields["System.CreatedDate"])
      : null,
    transitions: getStateTransitions(updates),
  };

  const parent = parentId
    ? relatedWorkItems.value.find((item) => item.id === parentId)
    : undefined;
  const children = childIds
    .map((childId) => relatedWorkItems.value.find((item) => item.id === childId))
    .filter((item): item is WorkItemDataType => !!item);

  const tags = workItem.fields["System.Tags"]
    ? workItem.fields["System.Tags"].split(";").map((tag) => tag.trim())
    : [];

  return {
    ...mapWorkItemSummary(workItem),
    description: workItem.fields["System.Description"] || "",
    acceptanceCriteria:
      workItem.fields["Microsoft.VSTS.Common.AcceptanceCriteria"] || "",
    tags,
    iterationPath: workItem.fields["System.IterationPath"] || "",
    parent: parent ? mapWorkItemSummary(parent) : null,
    children: children.map(mapWorkItemSummary),
    comments: comments
      .map(mapComment)
      .sort((a, b) => b.createdDate.valueOf() - a.createdDate.valueOf()),
    timeline,
  };
}

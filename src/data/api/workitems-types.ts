export type WorkItemResponseType = {
  count: number;
  value: WorkItemDataType[];
};

export type WorkItemDataType = {
  id: number;
  rev: number;
  fields: {
    "System.Id": number;
    "System.Title": string;
    "System.WorkItemType": string;
    "System.AssignedTo": { displayName: string } | null;
    "System.State": string;
    "System.Parent": number | null;
    "System.CreatedDate": Date;
    "System.Tags": string;
    "System.Description"?: string;
    "System.IterationPath"?: string;
    "Microsoft.VSTS.Common.AcceptanceCriteria"?: string;
    "Microsoft.VSTS.Scheduling.StoryPoints": number | null;
    "Microsoft.VSTS.Scheduling.OriginalEstimate": number | null;
    "Microsoft.VSTS.Scheduling.RemainingWork": number | null;
    "Microsoft.VSTS.Scheduling.CompletedWork": number | null;
  };
  relations?: WorkItemRelationType[];
};

export type WorkItemRelationType = {
  rel: string;
  url: string;
  attributes?: { name?: string };
};

export type WorkItemRevisionType = {
  id: number;
  rev: number;
  fields: Record<string, any>;
  url: string;
};

export type WorkItemCommentType = {
  id: number;
  workItemId: number;
  version: number;
  text: string;
  createdBy: { displayName: string } | null;
  createdDate: string;
  modifiedDate?: string;
};

export type WorkItemCommentsResponseType = {
  totalCount: number;
  count: number;
  comments: WorkItemCommentType[];
};

export type WorkItemUpdateType = {
  id: number;
  rev: number;
  fields?: Record<string, any>;
  relations?: any[];
  revisedBy?: {
    id: string;
    name: string;
    displayName: string;
    uniqueName: string;
    url: string;
    imageUrl: string;
  };
  revisedDate?: string;
  url: string;
};

export type WorkItemSummaryType = {
  id: number;
  title: string;
  type: string;
  state: string;
  assignedTo: string;
  points: number | null;
  originalEstimate: number | null;
  remaining: number | null;
  completed: number | null;
};

export type WorkItemDetailType = WorkItemSummaryType & {
  description: string;
  acceptanceCriteria: string;
  tags: string[];
  iterationPath: string;
  parent: WorkItemSummaryType | null;
  children: WorkItemSummaryType[];
};

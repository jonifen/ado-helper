export type IterationType = {
  workItemRelations: WorkItemRelationType[];
  url: string;
};

export type WorkItemRelationType = {
  rel: string;
  source: WorkItemType;
  target: WorkItemType;
};

export type WorkItemType = {
  id: number;
  url: string;
};

export type IterationsType = {
  count: number;
  value: Array<IterationsValueType>;
};

export type IterationsValueType = {
  id: string;
  name: string;
  path: string;
  attributes: {
    startDate: string;
    finishDate: string;
    timeFrame: string;
  };
  url: string;
};

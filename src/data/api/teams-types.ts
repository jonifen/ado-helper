export type GetTeamsType = {
  count: number;
  value: Array<GetTeamType>;
};

export type GetTeamType = {
  id: string;
  name: string;
  description: string;
};

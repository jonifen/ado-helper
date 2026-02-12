export type IterationDataType = {
  name: string;
  path: string;
  url: string;
  teamName: string;
  startDate: Date;
  endDate: Date;
  workItems: IterationWorkItemsType[];
  resource: IterationDataResourceType;
  payloadCreatedDate: Date;
};

export type IterationWorkItemsType = {
  id: number;
  parentId?: number | null;
  title: string;
  state: string;
  type: IterationWorkItemsTypeType;
  points: number;
  originalEstimate: number;
  remaining: number;
  completed: number;
  assignedTo?: string;
  createdDate: Date;
  children: IterationWorkItemsType[];
  createdAfterSprintStarted: boolean;
  activeBeforeSprintStarted: boolean;
  overEstimate?: boolean;
  totals: IterationWorkItemTotalsType;
};

export type IterationWorkItemTotalsType = {
  totalEstimated: number;
  totalRemaining: number;
  totalCompleted: number;
};

export type IterationWorkItemsTypeType = {
  name: string;
  icon: string;
};

export type IterationDataResourceType = {
  team: IterationDataTeamType;
  members: IterationDataMembersType[];
  sprint: IterationDataSprintType;
};

export type IterationDataSprintType = {
  daysRemaining: number;
};

/* Team data for iteration */

export type IterationDataTeamType = {
  id: string;
  name: string;
  capacity: IterationDataTeamCapacityType;
  workload: IterationDataWorkloadType;
};

export type IterationDataTeamCapacityType = {
  absence: TeamAbsenceCapacityType;
};

export type TeamAbsenceCapacityType = {
  dates: Date[];
  totals: {
    days: number;
    daysRemaining: number;
  };
};

export type IterationDataWorkloadType = {
  totalEstimated: number;
  totalRemaining: number;
  totalCompleted: number;
  totalPoints: number;
  timeDelta: number;
  totalPointsEstimated?: number;
  totalPointsRemaining?: number;
};

/* Member data for iteration */

export type IterationDataMembersType = {
  id: string;
  name: string;
  capacity: IterationDataMemberCapacityType;
  workload: IterationDataWorkloadType;
};

export type IterationDataMemberCapacityType = {
  absence: MemberAbsenceCapacityType;
  dailyHours: number;
  iterationLength: number;
  availableDaysRemaining: number;
};

export type MemberAbsenceCapacityType = {
  dates: Date[];
  totals: {
    days: number;
    hours: number;
    daysRemaining: number;
    hoursRemaining: number;
  };
};

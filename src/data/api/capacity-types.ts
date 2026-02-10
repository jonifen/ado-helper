export type SprintCapacityType = {
  teamMembers: TeamMembersType[];
  totalCapacityPerDay: number;
  totalDaysOff: number;
};

export type TeamMembersType = {
  teamMember: TeamMemberType;
  activities: TeamMemberActivityType[];
  daysOff: DaysOffType[];
};

export type TeamMemberType = {
  id: string;
  displayName: string;
  imageUrl?: string;
};

export type TeamMemberActivityType = {
  capacityPerDay: number;
  name: string;
};

export type DaysOffType = {
  start: number;
  end: string;
};

export type TeamDaysOffType = {
  daysOff: DaysOffType[];
};

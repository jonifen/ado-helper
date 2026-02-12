import { getIteration, getIterationWorkItems } from "../data/api/iterations.js";
import { getSprintCapacity, getTeamDaysOff } from "../data/api/capacity.js";
import type {
  DaysOffType,
  SprintCapacityType,
  TeamDaysOffType,
} from "../data/api/capacity-types.js";
import {
  getWorkItemsByIds,
  getWorkItemUpdates,
} from "../data/api/workitems.js";
import type { WorkItemDataType } from "../data/api/workitems-types.js";
import { sortWorkItemsByState } from "../utils/workitem-sort.js";
import { getTeam } from "../data/api/teams.js";
import { generateCsv } from "../utils/csv-generation.js";
import type {
  IterationDataMembersType,
  IterationDataTeamType,
  IterationDataType,
  IterationDataWorkloadType,
  IterationWorkItemsType,
} from "./iterations-manager-types.js";
import { useIterationStore } from "../data/iteration-store.js";

const ITERATION_LENGTH_IN_DAYS = 10;

const workItemIcons: {
  "User Story": string;
  Bug: string;
  "Small Works": string;
} = {
  "User Story": "📖",
  Bug: "🐞",
  "Small Works": "⚒️",
};

function getWorkItemIcon(
  workItemType: "User Story" | "Bug" | "Small Works",
): string {
  try {
    return workItemIcons[workItemType] as string;
  } catch {
    return "❓";
  }
}

function mapWorkItem(
  workItem: WorkItemDataType,
  iterationStartDate: Date,
  tasks: WorkItemDataType[],
  additionalData?: { activatedDate: Date | null },
): IterationWorkItemsType {
  const children =
    tasks.length > 0
      ? tasks
          .filter(
            (task) =>
              task.fields["System.Parent"] === workItem.fields["System.Id"],
          )
          .map((task) => mapWorkItem(task, iterationStartDate, []))
      : [];

  return {
    id: workItem.fields["System.Id"],
    parentId: workItem.fields["System.Parent"],
    title: workItem.fields["System.Title"],
    state: workItem.fields["System.State"],
    type: {
      name: workItem.fields["System.WorkItemType"],
      icon: getWorkItemIcon(
        workItem.fields["System.WorkItemType"] as
          | "User Story"
          | "Bug"
          | "Small Works",
      ),
    },
    points: workItem.fields["Microsoft.VSTS.Scheduling.StoryPoints"] || 0,
    originalEstimate:
      workItem.fields["Microsoft.VSTS.Scheduling.OriginalEstimate"] || 0,
    remaining: workItem.fields["Microsoft.VSTS.Scheduling.RemainingWork"] || 0,
    completed: workItem.fields["Microsoft.VSTS.Scheduling.CompletedWork"] || 0,
    createdDate: new Date(workItem.fields["System.CreatedDate"]),
    assignedTo: workItem.fields["System.AssignedTo"]?.displayName || "",
    createdAfterSprintStarted:
      new Date(workItem.fields["System.CreatedDate"]).valueOf() >
      iterationStartDate.valueOf(),
    activeBeforeSprintStarted: additionalData?.activatedDate
      ? additionalData.activatedDate.valueOf() < iterationStartDate.valueOf()
      : false,
    overEstimate:
      Number(workItem.fields["Microsoft.VSTS.Scheduling.CompletedWork"]) >
      Number(workItem.fields["Microsoft.VSTS.Scheduling.OriginalEstimate"]),
    children: children || [],
    totals:
      children.length > 0
        ? {
            totalEstimated: children.reduce((prev, current) => {
              return prev + (current.originalEstimate || 0);
            }, 0),
            totalRemaining: children.reduce((prev, current) => {
              return prev + (current.remaining || 0);
            }, 0),
            totalCompleted: children.reduce((prev, current) => {
              return prev + (current.completed || 0);
            }, 0),
          }
        : {
            totalEstimated: 0,
            totalRemaining: 0,
            totalCompleted: 0,
          },
  };
}

async function mapWorkItems(
  userStories: WorkItemDataType[],
  tasks: WorkItemDataType[],
  iterationStartDate: Date,
): Promise<IterationWorkItemsType[]> {
  const data = await Promise.all(
    sortWorkItemsByState(userStories).map(async (story) => {
      const workItemUpdates = await getWorkItemUpdates(story.id);

      // Find when the work item state changed to "Active"
      let activatedDate: Date | null = null;
      for (const update of workItemUpdates) {
        if (update.fields && update.fields["System.State"]) {
          const stateChange = update.fields["System.State"];
          if (stateChange.newValue === "Active") {
            activatedDate = new Date(update.revisedDate!);
            break; // Found the first time it changed to Active
          }
        }
      }

      const additionalData = {
        activatedDate,
      };

      return mapWorkItem(story, iterationStartDate, tasks, additionalData);
    }),
  );

  return data;
}

const calculateAbsenceDates = (daysOff: DaysOffType[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    daysOff &&
    daysOff.reduce(
      (
        acc: {
          totals: {
            days: number;
            daysRemaining: number;
            hours: number;
            hoursRemaining: number;
          };
          dates: Date[];
        },
        dayOff,
      ) => {
        let { totals, dates } = acc;

        let start = new Date(dayOff.start);
        let end = new Date(dayOff.end);

        const currentDay = new Date(start);
        currentDay.setHours(0, 0, 0, 0);
        end = new Date(end);
        end.setHours(0, 0, 0, 0);

        while (currentDay <= end) {
          const day = currentDay.getDay();
          if (day !== 0 && day !== 6) {
            dates.push(new Date(currentDay));
            totals.days++;

            if (currentDay.valueOf() >= today.valueOf()) {
              totals.daysRemaining++;
            }
          }
          currentDay.setDate(currentDay.getDate() + 1);
        }

        return {
          totals,
          dates,
        };
      },
      {
        totals: { days: 0, daysRemaining: 0, hours: 0, hoursRemaining: 0 },
        dates: [],
      },
    )
  );
};

function calculateWorkItemTotals(
  workItems: IterationWorkItemsType[],
  calcData: IterationDataWorkloadType,
  memberName?: string,
) {
  const calcs = workItems.reduce(
    (acc: IterationDataWorkloadType, workItem: IterationWorkItemsType) => {
      const workItemToBeIncluded =
        !memberName || workItem.assignedTo === memberName;

      let output = workItemToBeIncluded
        ? {
            totalEstimated: acc.totalEstimated + workItem.originalEstimate,
            totalRemaining: acc.totalRemaining + workItem.remaining,
            totalCompleted: acc.totalCompleted + workItem.completed,
            totalPoints: acc.totalPoints + workItem.points,
            timeDelta: 0,
          }
        : {
            ...acc,
          };

      if (workItem.children.length > 0) {
        output = calculateWorkItemTotals(workItem.children, output, memberName);
      }

      return output;
    },
    {
      totalEstimated: calcData.totalEstimated,
      totalRemaining: calcData.totalRemaining,
      totalCompleted: calcData.totalCompleted,
      totalPoints: calcData.totalPoints,
      timeDelta: 0,
    },
  );

  return calcs;
}

function mapTeam(
  teamDaysOffData: TeamDaysOffType,
  name: string,
  workItems: IterationWorkItemsType[],
): IterationDataTeamType {
  const workload = calculateWorkItemTotals(workItems, {
    totalEstimated: 0,
    totalRemaining: 0,
    totalCompleted: 0,
    totalPoints: 0,
    timeDelta: 0,
  });

  return {
    id: name,
    name: name,
    capacity: {
      absence: calculateAbsenceDates(teamDaysOffData.daysOff),
    },
    workload,
  };
}

function mapTeamMembers(
  capacityData: SprintCapacityType,
  workItems: IterationWorkItemsType[],
  teamResource: IterationDataTeamType,
  daysRemaining: number,
): IterationDataMembersType[] {
  const members: IterationDataMembersType[] = capacityData.teamMembers.map(
    (member) => {
      const totalCapacityPerDay = member.activities.reduce(
        (total, activity) => total + activity.capacityPerDay,
        0,
      );

      const workload = calculateWorkItemTotals(
        workItems,
        {
          totalEstimated: 0,
          totalRemaining: 0,
          totalCompleted: 0,
          totalPoints: 0,
          timeDelta: 0,
        },
        member.teamMember.displayName,
      );

      const memberAbsence = calculateAbsenceDates(member.daysOff);
      memberAbsence.totals.hours =
        memberAbsence.totals.days * totalCapacityPerDay;
      memberAbsence.totals.hoursRemaining =
        memberAbsence.totals.daysRemaining * totalCapacityPerDay;

      const workDaysRemaining =
        daysRemaining -
        memberAbsence.totals.daysRemaining -
        teamResource.capacity.absence.totals.daysRemaining;
      const workHoursCompleted =
        (ITERATION_LENGTH_IN_DAYS -
          (memberAbsence.totals.days +
            teamResource.capacity.absence.totals.days) -
          workDaysRemaining) *
        totalCapacityPerDay;

      workload.timeDelta = workload.totalCompleted - workHoursCompleted;

      return {
        id: member.teamMember.id,
        name: member.teamMember.displayName,
        capacity: {
          dailyHours: totalCapacityPerDay,
          absence: memberAbsence,
          availableDaysRemaining: workDaysRemaining,
          iterationLength: ITERATION_LENGTH_IN_DAYS,
        },
        workload,
      };
    },
  );

  return members;
}

function calculateDaysRemaining(
  sprintStartDate: Date,
  sprintEndDate: Date,
): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentDay = new Date(today);
  sprintStartDate.setHours(0, 0, 0, 0);
  sprintEndDate.setHours(0, 0, 0, 0);

  let daysRemaining = 0;

  if (today.valueOf() < sprintStartDate.valueOf()) {
    return ITERATION_LENGTH_IN_DAYS;
  }

  while (currentDay <= sprintEndDate) {
    const day = currentDay.getDay();
    if (day !== 0 && day !== 6) {
      if (currentDay.valueOf() >= today.valueOf()) {
        daysRemaining++;
      }
    }
    currentDay.setDate(currentDay.getDate() + 1);
  }

  return daysRemaining;
}

export async function getIterationData(
  teamId: string,
  iterationId: string,
): Promise<IterationDataType> {
  const team = await getTeam(teamId);
  const iteration = await getIteration(teamId, iterationId);
  const iterationData = await getIterationWorkItems(teamId, iterationId);
  const workItemIds = iterationData.workItemRelations
    .filter((relation) => relation.target.id !== null)
    .map((relation) => relation.target.id);

  const workItemsByIds =
    workItemIds.length > 0
      ? await getWorkItemsByIds(workItemIds)
      : {
          count: 0,
          value: [],
        };
  const capacityData = await getSprintCapacity(teamId, iterationId);
  const teamDaysOffData = await getTeamDaysOff(teamId, iterationId);

  const userStories = workItemsByIds.value.filter((workItem) =>
    ["Small Works", "User Story", "Bug"].includes(
      workItem.fields["System.WorkItemType"],
    ),
  );
  const tasks = workItemsByIds.value.filter(
    (workItem) => workItem.fields["System.WorkItemType"] === "Task",
  );

  const workItems = await mapWorkItems(
    userStories,
    tasks,
    new Date(iteration.attributes.startDate),
  );

  const daysRemaining = calculateDaysRemaining(
    new Date(iteration.attributes.startDate),
    new Date(iteration.attributes.finishDate),
  );
  const teamResource = mapTeam(teamDaysOffData, teamId, workItems);
  const membersResource = mapTeamMembers(
    capacityData,
    workItems,
    teamResource,
    daysRemaining,
  );

  const output: IterationDataType = {
    name: iteration.name,
    path: iteration.path,
    url: iteration.url,
    teamName: team.name,
    startDate: new Date(iteration.attributes.startDate),
    endDate: new Date(iteration.attributes.finishDate),
    workItems: workItems,
    resource: {
      team: teamResource,
      members: membersResource,
      sprint: {
        daysRemaining,
      },
    },
    payloadCreatedDate: new Date(),
  };

  return output;
}

export async function getIterationDataCsv(): Promise<string> {
  const iterationData = useIterationStore.getState().data;
  const csv = generateCsv(iterationData);
  return csv;
}

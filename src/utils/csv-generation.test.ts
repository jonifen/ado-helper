import { generateCsv } from "./csv-generation.js";
import { describe, it, expect } from "vitest";

describe("generateCsv", () => {
  it("should generate a CSV string with correct headers and values", () => {
    const mockData = {
      name: "Iteration 1",
      path: "Project\\Iteration 1",
      url: "http://example.com/iteration/1",
      teamName: "Team A",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-01-10"),
      workItems: [
        {
          id: 1,
          parentId: 8,
          title: "Test Work Item 1",
          type: { name: "Bug", icon: "🐞" },
          state: "Active",
          assignedTo: "Alice",
          createdDate: new Date("2026-01-01"),
          points: 5,
          originalEstimate: 8,
          remaining: 3,
          completed: 2,
          children: [],
          createdAfterSprintStarted: false,
          totals: { totalEstimated: 0, totalRemaining: 0, totalCompleted: 0 },
        },
        {
          id: 2,
          parentId: 3,
          title: "Test Work Item 2",
          type: { name: "Task", icon: "⚒️" },
          state: "Closed",
          assignedTo: undefined,
          createdDate: new Date("2026-01-02"),
          points: 0,
          originalEstimate: 0,
          remaining: 0,
          completed: 0,
          children: [],
          createdAfterSprintStarted: false,
          totals: { totalEstimated: 0, totalRemaining: 0, totalCompleted: 0 },
        },
      ],
      resource: {
        team: {
          id: "team-a",
          name: "Team A",
          capacity: {
            absence: { dates: [], totals: { days: 0, daysRemaining: 0 } },
          },
          workload: {
            totalEstimated: 0,
            totalRemaining: 0,
            totalCompleted: 0,
            totalPoints: 0,
            timeDelta: 0,
          },
        },
        members: [],
        sprint: { daysRemaining: 0 },
      },
      payloadCreatedDate: new Date("2026-01-01"),
    };

    const csv = generateCsv(mockData);
    const lines = csv.split("\n");
    expect(lines[0]).toBe(
      "ID,Parent,Title,WorkItemType,State,AssignedTo,CreatedDate,CreatedAfterSprintStarted,ActiveBeforeSprintStarted,Points,OriginalEstimate,RemainingWork,Completed",
    );
    expect(lines[1]).toBe(
      `"1","8","Test Work Item 1","Bug","Active","Alice","2026-01-01 00:00","","","5","8","3","2"`,
    );
    expect(lines[2]).toBe(
      `"2","3","Test Work Item 2","Task","Closed","Unassigned","2026-01-02 00:00","","","","0","0","0"`,
    );
  });

  it("should handle empty workItems array", () => {
    const mockData = {
      name: "Iteration 1",
      path: "Project\\Iteration 1",
      url: "http://example.com/iteration/1",
      teamName: "Team A",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-01-10"),
      workItems: [],
      resource: {
        team: {
          id: "team-a",
          name: "Team A",
          capacity: {
            absence: { dates: [], totals: { days: 0, daysRemaining: 0 } },
          },
          workload: {
            totalEstimated: 0,
            totalRemaining: 0,
            totalCompleted: 0,
            totalPoints: 0,
            timeDelta: 0,
          },
        },
        members: [],
        sprint: { daysRemaining: 0 },
      },
      payloadCreatedDate: new Date("2026-01-01"),
    };
    const csv = generateCsv(mockData);
    expect(csv).toBe("\n");
  });
});

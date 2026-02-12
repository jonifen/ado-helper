// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { CompletedWorkChart } from "./completed-work-chart.js";
import type { IterationDataResourceType } from "../managers/iterations-manager-types.js";
import { describe, it, expect } from "vitest";

const sampleResource: IterationDataResourceType = {
  team: {
    id: "team-1",
    name: "Team 1",
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
  members: [
    {
      id: "1",
      name: "Alice",
      capacity: {
        absence: { dates: [], totals: { days: 0, hours: 0, daysRemaining: 0, hoursRemaining: 0 } },
        dailyHours: 8,
        iterationLength: 10,
        availableDaysRemaining: 10,
      },
      workload: { totalCompleted: 10, totalEstimated: 0, totalRemaining: 0, totalPoints: 0, timeDelta: 0 },
    },
    {
      id: "2",
      name: "Bob",
      capacity: {
        absence: { dates: [], totals: { days: 0, hours: 0, daysRemaining: 0, hoursRemaining: 0 } },
        dailyHours: 8,
        iterationLength: 10,
        availableDaysRemaining: 10,
      },
      workload: { totalCompleted: 20, totalEstimated: 0, totalRemaining: 0, totalPoints: 0, timeDelta: 0 },
    },
    {
      id: "3",
      name: "Charlie",
      capacity: {
        absence: { dates: [], totals: { days: 0, hours: 0, daysRemaining: 0, hoursRemaining: 0 } },
        dailyHours: 8,
        iterationLength: 10,
        availableDaysRemaining: 10,
      },
      workload: { totalCompleted: 5, totalEstimated: 0, totalRemaining: 0, totalPoints: 0, timeDelta: 0 },
    },
  ],
  sprint: { daysRemaining: 5 },
};

describe("CompletedWorkChart", () => {
  it("renders chart title", () => {
    render(<CompletedWorkChart resource={sampleResource} />);
    expect(screen.getByText(/Completed hours/i)).toBeTruthy();
  });
});

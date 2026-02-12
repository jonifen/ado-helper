// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { IterationCalculations } from "./iteration-calculations.js";
import { describe, it, expect } from "vitest";
import type { IterationWorkItemsType } from "../managers/iterations-manager-types.js";

const sampleResource = {
  team: {
    id: "team-1",
    name: "Team 1",
    capacity: { absence: { dates: [], totals: { days: 0, daysRemaining: 0 } } },
    workload: { totalEstimated: 0, totalRemaining: 0, totalCompleted: 0, totalPoints: 0, timeDelta: 0 },
  },
  members: [
    {
      id: "1",
      name: "Alice",
      capacity: { absence: { dates: [], totals: { days: 0, hours: 0, daysRemaining: 0, hoursRemaining: 0 } }, dailyHours: 8, iterationLength: 10, availableDaysRemaining: 10 },
      workload: { totalCompleted: 10, totalEstimated: 0, totalRemaining: 0, totalPoints: 0, timeDelta: 0 },
    },
  ],
  sprint: { daysRemaining: 5 },
};
const sampleWorkItems: IterationWorkItemsType[] = [];
const sampleDate = new Date();

describe("IterationCalculations", () => {
  it("renders calculations heading", () => {
    render(
      <IterationCalculations resource={sampleResource} workItems={sampleWorkItems} sprintEndDate={sampleDate} />
    );
    expect(document.querySelector("h2")).toBeTruthy();
  });
});

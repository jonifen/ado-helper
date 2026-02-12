// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import * as iterationsManager from "./iterations-manager.js";

// Mock all external dependencies
vi.mock("../data/api/iterations.js", () => ({
  getIteration: vi.fn().mockResolvedValue({
    name: "Sprint 1",
    path: "Root/Sprint 1",
    url: "url",
    teamName: "Team 1",
    attributes: { startDate: new Date().toISOString(), finishDate: new Date().toISOString() },
  }),
  getIterationWorkItems: vi.fn().mockResolvedValue({
    workItemRelations: [
      { target: { id: 1 } },
      { target: { id: 2 } },
    ],
  }),
}));
vi.mock("../data/api/capacity.js", () => ({
  getSprintCapacity: vi.fn().mockResolvedValue({ teamMembers: [] }),
  getTeamDaysOff: vi.fn().mockResolvedValue({ daysOff: [] }),
}));
vi.mock("../data/api/workitems.js", () => ({
  getWorkItemsByIds: vi.fn().mockResolvedValue({ value: [], count: 0 }),
  getWorkItemUpdates: vi.fn().mockResolvedValue([]),
}));
vi.mock("../data/api/teams.js", () => ({
  getTeam: vi.fn().mockResolvedValue({ name: "Team 1" }),
}));
vi.mock("../utils/csv-generation.js", () => ({
  generateCsv: vi.fn().mockReturnValue("csv-content"),
}));
vi.mock("../data/iteration-store.js", () => ({
  useIterationStore: { getState: () => ({ data: {} }) },
}));


describe("iterations-manager", () => {
  it("getIterationData returns expected structure", async () => {
    const result = await iterationsManager.getIterationData("team-1", "iter-1");
    expect(result).toHaveProperty("name");
    expect(result).toHaveProperty("resource");
    expect(result.resource).toHaveProperty("team");
    expect(result.resource).toHaveProperty("members");
    expect(result.resource).toHaveProperty("sprint");
  });

  it("getIterationDataCsv returns csv string", async () => {
    const csv = await iterationsManager.getIterationDataCsv();
    expect(csv).toBe("csv-content");
  });
});

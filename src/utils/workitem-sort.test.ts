import { sortWorkItemsByState } from "./workitem-sort.js";
import type { WorkItemDataType } from "../data/api/workitems-types.js";
import { describe, it, expect } from "vitest";

describe("sortWorkItemsByState", () => {
  const makeWorkItem = (id: number, state: string): WorkItemDataType => ({
    id,
    rev: 1,
    fields: {
      "System.Id": id,
      "System.Title": `Title ${id}`,
      "System.WorkItemType": "Task",
      "System.AssignedTo": null,
      "System.State": state,
      "System.Parent": null,
      "System.CreatedDate": new Date(),
      "System.Tags": "",
      "Microsoft.VSTS.Scheduling.StoryPoints": null,
      "Microsoft.VSTS.Scheduling.OriginalEstimate": null,
      "Microsoft.VSTS.Scheduling.RemainingWork": null,
      "Microsoft.VSTS.Scheduling.CompletedWork": null,
    },
  });

  it("sorts by state order", () => {
    const items = [
      makeWorkItem(1, "Closed"),
      makeWorkItem(2, "Active"),
      makeWorkItem(3, "New"),
      makeWorkItem(4, "Ready"),
      makeWorkItem(5, "Resolved"),
    ];
    const sorted = sortWorkItemsByState(items);
    const expectedOrder = [2, 4, 3, 5, 1]; // Active, Ready, New, Resolved, Closed
    expect(sorted.map((w) => w.id)).toEqual(expectedOrder);
  });

  it("puts unknown states last", () => {
    const items = [
      makeWorkItem(1, "Unknown"),
      makeWorkItem(2, "Active"),
      makeWorkItem(3, "Closed"),
    ];
    const sorted = sortWorkItemsByState(items);
    expect(sorted.map((w) => w.id)).toEqual([2, 3, 1]);
  });

  it("handles empty array", () => {
    expect(sortWorkItemsByState([])).toEqual([]);
  });
});

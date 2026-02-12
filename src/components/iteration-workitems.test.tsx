// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { IterationWorkitems } from "./iteration-workitems.js";
import { describe, it, expect } from "vitest";
import type { IterationWorkItemsType } from "../managers/iterations-manager-types.js";

const sampleWorkItems: IterationWorkItemsType[] = [
  {
    id: 1,
    parentId: 0,
    title: "Test Story",
    state: "Active",
    type: { name: "Story", icon: "S" },
    points: 3,
    originalEstimate: 3,
    remaining: 1,
    completed: 2,
    assignedTo: "Alice",
    createdDate: new Date(),
    children: [],
    createdAfterSprintStarted: false,
    activeBeforeSprintStarted: false,
    totals: { totalEstimated: 3, totalRemaining: 1, totalCompleted: 2 },
    overEstimate: false,
  },
];

describe("IterationWorkitems", () => {
  it("renders workitems heading", () => {
    render(<IterationWorkitems workItems={sampleWorkItems} />);
    expect(document.querySelector("h3")).toBeTruthy();
  });
});

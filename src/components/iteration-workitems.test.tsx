// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { IterationWorkitems } from "./iteration-workitems.js";
import { describe, it, expect } from "vitest";

const sampleWorkItems = [
  {
    id: 1,
    parentId: undefined,
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
  },
];

describe("IterationWorkitems", () => {
  it("renders workitems heading", () => {
    render(<IterationWorkitems workItems={sampleWorkItems} />);
    expect(document.querySelector("h3")).toBeTruthy();
  });
});

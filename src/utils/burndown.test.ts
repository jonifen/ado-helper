import { describe, it, expect } from "vitest";
import { buildFieldTimeline, computeBurndown } from "./burndown.js";
import type { WorkItemRevisionType } from "../data/api/workitems-types.js";

describe("buildFieldTimeline", () => {
  it("extracts and sorts a field's value across revisions", () => {
    const revisions: WorkItemRevisionType[] = [
      {
        id: 1,
        rev: 2,
        url: "",
        fields: {
          "System.ChangedDate": "2026-01-02T00:00:00Z",
          "Microsoft.VSTS.Scheduling.StoryPoints": 5,
        },
      },
      {
        id: 1,
        rev: 1,
        url: "",
        fields: {
          "System.ChangedDate": "2026-01-01T00:00:00Z",
          "Microsoft.VSTS.Scheduling.StoryPoints": 3,
        },
      },
    ];

    expect(
      buildFieldTimeline(revisions, "Microsoft.VSTS.Scheduling.StoryPoints"),
    ).toEqual([
      { date: new Date("2026-01-01T00:00:00Z"), value: 3 },
      { date: new Date("2026-01-02T00:00:00Z"), value: 5 },
    ]);
  });

  it("treats a missing field value as 0", () => {
    const revisions: WorkItemRevisionType[] = [
      { id: 1, rev: 1, url: "", fields: { "System.ChangedDate": "2026-01-01T00:00:00Z" } },
    ];
    expect(
      buildFieldTimeline(revisions, "Microsoft.VSTS.Scheduling.StoryPoints"),
    ).toEqual([{ date: new Date("2026-01-01T00:00:00Z"), value: 0 }]);
  });

  it("skips revisions with no ChangedDate", () => {
    const revisions: WorkItemRevisionType[] = [
      { id: 1, rev: 1, url: "", fields: { "Microsoft.VSTS.Scheduling.StoryPoints": 3 } },
    ];
    expect(buildFieldTimeline(revisions, "Microsoft.VSTS.Scheduling.StoryPoints")).toEqual([]);
  });

  it("treats a Closed item's value as 0, even though ADO doesn't zero the field itself", () => {
    const revisions: WorkItemRevisionType[] = [
      {
        id: 1,
        rev: 1,
        url: "",
        fields: {
          "System.ChangedDate": "2026-01-01T00:00:00Z",
          "System.State": "Active",
          "Microsoft.VSTS.Scheduling.StoryPoints": 5,
        },
      },
      {
        id: 1,
        rev: 2,
        url: "",
        fields: {
          "System.ChangedDate": "2026-01-03T00:00:00Z",
          "System.State": "Closed",
          "Microsoft.VSTS.Scheduling.StoryPoints": 5,
        },
      },
    ];

    expect(
      buildFieldTimeline(revisions, "Microsoft.VSTS.Scheduling.StoryPoints"),
    ).toEqual([
      { date: new Date("2026-01-01T00:00:00Z"), value: 5 },
      { date: new Date("2026-01-03T00:00:00Z"), value: 0 },
    ]);
  });

  it("treats Resolved and Removed as terminal too, case-insensitively", () => {
    const makeRevision = (state: string): WorkItemRevisionType => ({
      id: 1,
      rev: 1,
      url: "",
      fields: {
        "System.ChangedDate": "2026-01-01T00:00:00Z",
        "System.State": state,
        "Microsoft.VSTS.Scheduling.StoryPoints": 8,
      },
    });

    expect(
      buildFieldTimeline([makeRevision("resolved")], "Microsoft.VSTS.Scheduling.StoryPoints")[0]?.value,
    ).toBe(0);
    expect(
      buildFieldTimeline([makeRevision("REMOVED")], "Microsoft.VSTS.Scheduling.StoryPoints")[0]?.value,
    ).toBe(0);
    expect(
      buildFieldTimeline([makeRevision("Active")], "Microsoft.VSTS.Scheduling.StoryPoints")[0]?.value,
    ).toBe(8);
  });
});

// 2026-01-01/02 = Thu/Fri, 01-03/04 = Sat/Sun (weekend), 01-05 = Mon.
describe("computeBurndown", () => {
  it("sums multiple item timelines per day and flat-lines before the first value", () => {
    const start = new Date("2026-01-01T00:00:00Z"); // Thu
    const end = new Date("2026-01-03T00:00:00Z"); // Sat — excluded as a weekend
    const today = new Date("2026-01-03T12:00:00Z");

    const itemA = [{ date: new Date("2026-01-01T09:00:00Z"), value: 5 }];
    const itemB = [
      { date: new Date("2026-01-01T09:00:00Z"), value: 3 },
      { date: new Date("2026-01-02T09:00:00Z"), value: 0 },
    ];

    const result = computeBurndown([itemA, itemB], start, end, today);

    expect(result.map((p) => p.remaining)).toEqual([8, 5]);
  });

  it("treats an item with no snapshot before a day as contributing 0", () => {
    const start = new Date("2026-01-01T00:00:00Z"); // Thu
    const end = new Date("2026-01-02T00:00:00Z"); // Fri
    const today = new Date("2026-01-02T12:00:00Z");

    // Item created partway through day 2 — shouldn't count on day 1.
    const item = [{ date: new Date("2026-01-02T15:00:00Z"), value: 4 }];

    const result = computeBurndown([item], start, end, today);
    expect(result.map((p) => p.remaining)).toEqual([0, 4]);
  });

  it("excludes weekends entirely from the series, not just flat-lining them", () => {
    const start = new Date("2026-01-02T00:00:00Z"); // Fri
    const end = new Date("2026-01-05T00:00:00Z"); // Mon
    const today = new Date("2026-01-05T12:00:00Z");

    const item = [{ date: new Date("2026-01-02T00:00:00Z"), value: 10 }];
    const result = computeBurndown([item], start, end, today);

    // Only Fri and Mon — Sat/Sun never appear as points at all.
    expect(result).toHaveLength(2);
    expect(result[0]?.date.getDay()).toBe(5); // Friday
    expect(result[1]?.date.getDay()).toBe(1); // Monday
  });

  it("nulls out remaining for days after today, but still computes ideal across working days only", () => {
    const start = new Date("2026-01-01T00:00:00Z"); // Thu
    const end = new Date("2026-01-05T00:00:00Z"); // Mon (Sat/Sun excluded)
    const today = new Date("2026-01-02T12:00:00Z"); // Fri

    const item = [{ date: new Date("2026-01-01T00:00:00Z"), value: 10 }];
    const result = computeBurndown([item], start, end, today);

    // Three working days in range (Thu, Fri, Mon); Mon is after today.
    expect(result.map((p) => p.remaining)).toEqual([10, 10, null]);
    expect(result.map((p) => p.ideal)).toEqual([10, 5, 0]);
  });

  it("returns an empty array when the range is invalid", () => {
    const start = new Date("2026-01-05T00:00:00Z");
    const end = new Date("2026-01-01T00:00:00Z");
    expect(computeBurndown([], start, end)).toEqual([]);
  });

  it("returns an empty array when the range is entirely a weekend", () => {
    const start = new Date("2026-01-03T00:00:00Z"); // Sat
    const end = new Date("2026-01-04T00:00:00Z"); // Sun
    expect(computeBurndown([], start, end)).toEqual([]);
  });

  it("handles a single-day iteration without dividing by zero", () => {
    const start = new Date("2026-01-01T00:00:00Z"); // Thu
    const end = new Date("2026-01-01T00:00:00Z");
    const today = new Date("2026-01-01T12:00:00Z");
    const item = [{ date: new Date("2026-01-01T00:00:00Z"), value: 5 }];

    const result = computeBurndown([item], start, end, today);
    expect(result).toEqual([{ date: expect.any(Date), remaining: 5, ideal: 0 }]);
  });
});

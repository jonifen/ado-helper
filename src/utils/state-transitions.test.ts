import { describe, it, expect } from "vitest";
import { getStateTransitions, getUpdateDate } from "./state-transitions.js";

describe("getStateTransitions", () => {
  it("returns an empty array when there are no updates", () => {
    expect(getStateTransitions([])).toEqual([]);
  });

  it("captures every state change in order", () => {
    const updates = [
      {
        fields: { "System.State": { oldValue: "New", newValue: "Ready" } },
        revisedDate: "2026-01-01T00:00:00Z",
      },
      {
        fields: { "System.State": { oldValue: "Ready", newValue: "Active" } },
        revisedDate: "2026-01-02T00:00:00Z",
      },
      {
        fields: { "System.State": { oldValue: "Active", newValue: "Resolved" } },
        revisedDate: "2026-01-05T00:00:00Z",
      },
    ];

    expect(getStateTransitions(updates)).toEqual([
      { state: "Ready", date: new Date("2026-01-01T00:00:00Z") },
      { state: "Active", date: new Date("2026-01-02T00:00:00Z") },
      { state: "Resolved", date: new Date("2026-01-05T00:00:00Z") },
    ]);
  });

  it("includes revisits as their own milestone, rather than only the first time a state was reached", () => {
    const updates = [
      {
        fields: { "System.State": { oldValue: "New", newValue: "Active" } },
        revisedDate: "2026-01-02T00:00:00Z",
      },
      {
        fields: { "System.State": { oldValue: "Active", newValue: "Resolved" } },
        revisedDate: "2026-01-05T00:00:00Z",
      },
      {
        fields: { "System.State": { oldValue: "Resolved", newValue: "Active" } },
        revisedDate: "2026-01-07T00:00:00Z",
      },
    ];

    expect(getStateTransitions(updates)).toEqual([
      { state: "Active", date: new Date("2026-01-02T00:00:00Z") },
      { state: "Resolved", date: new Date("2026-01-05T00:00:00Z") },
      { state: "Active", date: new Date("2026-01-07T00:00:00Z") },
    ]);
  });

  it("isn't limited to any fixed set of state names", () => {
    const updates = [
      {
        fields: { "System.State": { oldValue: "New", newValue: "Committed" } },
        revisedDate: "2026-01-01T00:00:00Z",
      },
      {
        fields: { "System.State": { oldValue: "Committed", newValue: "Doing" } },
        revisedDate: "2026-01-02T00:00:00Z",
      },
    ];

    expect(getStateTransitions(updates).map((t) => t.state)).toEqual([
      "Committed",
      "Doing",
    ]);
  });

  it("ignores updates that don't touch System.State", () => {
    const updates = [
      { fields: { "System.Title": { newValue: "Renamed" } }, revisedDate: "2026-01-01T00:00:00Z" },
    ];
    expect(getStateTransitions(updates)).toEqual([]);
  });

  it("sorts out-of-order updates by date", () => {
    const updates = [
      {
        fields: { "System.State": { oldValue: "Active", newValue: "Resolved" } },
        revisedDate: "2026-01-05T00:00:00Z",
      },
      {
        fields: { "System.State": { oldValue: "New", newValue: "Active" } },
        revisedDate: "2026-01-02T00:00:00Z",
      },
    ];

    expect(getStateTransitions(updates).map((t) => t.state)).toEqual([
      "Active",
      "Resolved",
    ]);
  });

  it("prefers Microsoft.VSTS.Common.StateChangeDate over the revisedDate sentinel", () => {
    // The real-world bug: for the current/latest revision, revisedDate is
    // the sentinel 9999-01-01 (meaning "not yet superseded"), not the date
    // the change happened.
    const updates = [
      {
        fields: {
          "System.State": { oldValue: "New", newValue: "Active" },
          "Microsoft.VSTS.Common.StateChangeDate": {
            oldValue: "2026-07-01T00:00:00Z",
            newValue: "2026-07-23T15:08:58.89Z",
          },
        },
        revisedDate: "9999-01-01T00:00:00Z",
      },
    ];

    expect(getStateTransitions(updates)).toEqual([
      { state: "Active", date: new Date("2026-07-23T15:08:58.89Z") },
    ]);
  });

  it("falls back to System.ChangedDate when StateChangeDate isn't tracked", () => {
    const updates = [
      {
        fields: {
          "System.State": { oldValue: "New", newValue: "Active" },
          "System.ChangedDate": {
            oldValue: "2026-07-01T00:00:00Z",
            newValue: "2026-07-23T15:08:58.89Z",
          },
        },
        revisedDate: "9999-01-01T00:00:00Z",
      },
    ];

    expect(getStateTransitions(updates)).toEqual([
      { state: "Active", date: new Date("2026-07-23T15:08:58.89Z") },
    ]);
  });
});

describe("getUpdateDate", () => {
  it("prefers StateChangeDate, then ChangedDate, then revisedDate", () => {
    expect(
      getUpdateDate({
        fields: {
          "Microsoft.VSTS.Common.StateChangeDate": { newValue: "2026-01-01T00:00:00Z" },
          "System.ChangedDate": { newValue: "2026-01-02T00:00:00Z" },
        },
        revisedDate: "9999-01-01T00:00:00Z",
      }),
    ).toEqual(new Date("2026-01-01T00:00:00Z"));

    expect(
      getUpdateDate({
        fields: { "System.ChangedDate": { newValue: "2026-01-02T00:00:00Z" } },
        revisedDate: "9999-01-01T00:00:00Z",
      }),
    ).toEqual(new Date("2026-01-02T00:00:00Z"));

    expect(getUpdateDate({ revisedDate: "2026-01-03T00:00:00Z" })).toEqual(
      new Date("2026-01-03T00:00:00Z"),
    );
  });

  it("returns null when no date is available", () => {
    expect(getUpdateDate({})).toBeNull();
  });
});

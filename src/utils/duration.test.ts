import { describe, it, expect } from "vitest";
import { formatDuration } from "./duration.js";

describe("formatDuration", () => {
  it("returns 0m for zero or negative durations", () => {
    expect(formatDuration(0)).toBe("0m");
    expect(formatDuration(-1000)).toBe("0m");
  });

  it("formats minutes-only durations", () => {
    expect(formatDuration(5 * 60_000)).toBe("5m");
  });

  it("formats hours and minutes when under a day", () => {
    expect(formatDuration(90 * 60_000)).toBe("1h 30m");
  });

  it("drops minutes once the duration spans whole days", () => {
    const ms = (2 * 24 * 60 + 2 * 60 + 10) * 60_000; // 2d 2h 10m
    expect(formatDuration(ms)).toBe("2d 2h");
  });

  it("formats a duration of exactly one day", () => {
    expect(formatDuration(24 * 60 * 60_000)).toBe("1d");
  });
});

import type { WorkItemRevisionType } from "../data/api/workitems-types.js";

export type FieldSnapshotType = { date: Date; value: number };

export type BurndownPointType = {
  date: Date;
  remaining: number | null;
  ideal: number;
};

// ADO doesn't zero out a field (e.g. Story Points, Remaining Work) just
// because an item reaches a terminal state — it keeps whatever value was
// last set. For a burndown, that value should stop counting as "remaining"
// once the item is done or dropped from scope, regardless of what the
// field itself still says. These are this team's terminal states.
const TERMINAL_STATES = new Set(["closed", "resolved", "removed"]);

function isTerminalState(state: unknown): boolean {
  return typeof state === "string" && TERMINAL_STATES.has(state.toLowerCase());
}

/**
 * Extracts a sorted timeline of a numeric field's value across a work
 * item's revisions (each revision carries a full field snapshot, not just
 * a diff, so this is the value AS OF that revision's ChangedDate). The
 * value is treated as 0 for any revision where the item is already in a
 * terminal state (Closed/Done/Removed), since that work is no longer
 * "remaining" even if the field wasn't manually reset.
 */
export function buildFieldTimeline(
  revisions: WorkItemRevisionType[],
  fieldName: string,
): FieldSnapshotType[] {
  const timeline = revisions
    .map((revision) => {
      const changedDate = revision.fields?.["System.ChangedDate"];
      if (!changedDate) return null;

      const rawValue = Number(revision.fields?.[fieldName]) || 0;
      const value = isTerminalState(revision.fields?.["System.State"])
        ? 0
        : rawValue;

      return { date: new Date(changedDate), value };
    })
    .filter((snapshot): snapshot is FieldSnapshotType => snapshot !== null);

  timeline.sort((a, b) => a.date.valueOf() - b.date.valueOf());
  return timeline;
}

function getValueAsOf(timeline: FieldSnapshotType[], asOf: Date): number {
  let value = 0;
  for (const snapshot of timeline) {
    if (snapshot.date.valueOf() > asOf.valueOf()) break;
    value = snapshot.value;
  }
  return value;
}

function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

// Developers only work Monday–Friday, so weekends are excluded entirely
// rather than plotted as flat/stalled progress — matching the same
// weekday-only convention calculateDaysRemaining already uses elsewhere in
// this codebase. This also means the ideal line divides remaining scope
// evenly across working days, not calendar days, so it doesn't expect any
// burn to happen over a weekend.
function eachWeekday(startDate: Date, endDate: Date): Date[] {
  const days: Date[] = [];
  const current = startOfDay(startDate);
  const end = startOfDay(endDate);

  while (current.valueOf() <= end.valueOf()) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      days.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }

  return days;
}

/**
 * Builds an actual + ideal burndown series, one point per working day
 * (Monday–Friday) of the iteration, by summing each item's field timeline
 * as of the end of that day. `remaining` is null for any day after `today`
 * — a burndown chart only ever shows actuals up to the present, not
 * projected into the future. `ideal` runs linearly from day one's actual
 * total down to zero on the iteration's last working day.
 */
export function computeBurndown(
  timelines: FieldSnapshotType[][],
  startDate: Date,
  endDate: Date,
  today: Date = new Date(),
): BurndownPointType[] {
  const days = eachWeekday(startDate, endDate);
  if (days.length === 0) return [];

  const remainingByDay = days.map((day) => {
    const asOf = endOfDay(day);
    return timelines.reduce(
      (total, timeline) => total + getValueAsOf(timeline, asOf),
      0,
    );
  });

  const startValue = remainingByDay[0] ?? 0;
  const lastIndex = days.length - 1;
  const todayEnd = endOfDay(today);

  return days.map((day, index) => ({
    date: day,
    remaining: endOfDay(day).valueOf() > todayEnd.valueOf() ? null : (remainingByDay[index] ?? 0),
    ideal:
      lastIndex === 0 ? 0 : Math.max(0, startValue - (startValue / lastIndex) * index),
  }));
}

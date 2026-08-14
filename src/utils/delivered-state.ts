// States that represent genuinely delivered work, for crediting "completed
// story points". Deliberately excludes "Removed" (descoped, not delivered)
// even though that's treated as terminal/zero-remaining for burndown
// purposes — a removed item shouldn't count as completed work.
const DELIVERED_STATES = new Set(["closed", "resolved"]);

export function isDeliveredState(state: string): boolean {
  return DELIVERED_STATES.has(state.toLowerCase());
}

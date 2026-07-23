type UpdateType = {
  fields?: {
    "System.State"?: { oldValue?: string; newValue?: string };
    "System.ChangedDate"?: { oldValue?: string; newValue?: string };
    "Microsoft.VSTS.Common.StateChangeDate"?: {
      oldValue?: string;
      newValue?: string;
    };
  };
  revisedDate?: string;
};

export type StateTransitionType = {
  state: string;
  date: Date;
};

// An update's root-level `revisedDate` is the date THAT revision was
// superseded by the next one — not the date the change happened. For the
// current/latest revision (which hasn't been superseded by anything yet),
// ADO fills it with the sentinel 9999-01-01T00:00:00Z to mean "still open".
//
// Microsoft.VSTS.Common.StateChangeDate is a dedicated field that only
// updates when the state itself changes, so it's the most direct signal
// and isn't affected by the sentinel-date issue. System.ChangedDate (which
// updates on any field edit) and revisedDate are used as fallbacks for
// work item types that don't track StateChangeDate.
export function getUpdateDate(update: UpdateType): Date | null {
  const dateString =
    update.fields?.["Microsoft.VSTS.Common.StateChangeDate"]?.newValue ||
    update.fields?.["System.ChangedDate"]?.newValue ||
    update.revisedDate;
  return dateString ? new Date(dateString) : null;
}

/**
 * Walks a work item's revision history and returns every time its state
 * changed, in chronological order. Unlike tracking a fixed set of named
 * states (e.g. "Ready"/"Active"/"Resolved"/"Closed"), this works regardless
 * of which states a team's process template actually uses, and reflects
 * genuine rework (e.g. reactivated after being resolved) as its own
 * milestone rather than only the first time a state was reached.
 */
export function getStateTransitions(updates: UpdateType[]): StateTransitionType[] {
  const transitions: StateTransitionType[] = [];

  for (const update of updates) {
    const newValue = update.fields?.["System.State"]?.newValue;
    if (!newValue) continue;

    const date = getUpdateDate(update);
    if (!date) continue;

    transitions.push({ state: newValue, date });
  }

  // ADO returns updates in chronological order already, but sort
  // defensively rather than assume it.
  transitions.sort((a, b) => a.date.valueOf() - b.date.valueOf());

  return transitions;
}

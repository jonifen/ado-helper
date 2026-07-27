import React from "react";
import { formatDuration } from "../utils/duration.js";
import type { WorkItemTimelineType } from "../managers/workitem-manager-types.js";

type Milestone = {
  label: string;
  date: Date;
};

export function WorkItemTimeline({
  timeline,
}: {
  timeline: WorkItemTimelineType;
}) {
  const history: Milestone[] = [
    ...(timeline.createdDate
      ? [{ label: "Created", date: timeline.createdDate }]
      : []),
    ...timeline.transitions.map((transition) => ({
      label: transition.state,
      date: transition.date,
    })),
  ];

  // Always add a "Now" stage after any real history, so the timeline shows
  // how long the item has sat in its current state so far, not just the
  // gaps between past transitions.
  const milestones: Milestone[] =
    history.length > 0 ? [...history, { label: "Now", date: new Date() }] : history;

  return (
    <div>
      <h3 className="text-lg font-bold text-[#9BCF69]">Timeline</h3>

      {milestones.length === 0 ? (
        <i className="text-sm">No state history available for this work item</i>
      ) : (
        <div className="flex flex-row items-center gap-2 text-sm mt-1 flex-wrap">
          {milestones.map((milestone, index) => {
            const isNowStage = index === milestones.length - 1 && index >= history.length;

            return (
              <React.Fragment key={index}>
                <div
                  className={
                    isNowStage
                      ? "border-1 border-dashed border-[#9BCF69] rounded-md px-2 py-1 text-center"
                      : "border-1 border-[#33373C] rounded-md bg-[#33373C] shadow-md px-2 py-1 text-center"
                  }
                >
                  <div className="font-bold text-[#9BCF69]">{milestone.label}</div>
                  <div className="text-xs text-gray-400 text-nowrap">
                    {milestone.date.toLocaleString()}
                  </div>
                </div>
                {index < milestones.length - 1 && (
                  <div className="text-xs text-gray-400 text-nowrap">
                    &rarr;{" "}
                    {formatDuration(
                      milestones[index + 1]!.date.valueOf() - milestone.date.valueOf(),
                    )}{" "}
                    &rarr;
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}

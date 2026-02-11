import type {
  WorkItemDataType,
  WorkItemResponseType,
} from "../data/api/workitems-types.js";
import { useSettingsStore } from "../data/settings-store.js";
import type { IterationWorkItemsType } from "../managers/iterations-manager-types.js";
import { sortWorkItemsByState } from "../utils/workitem-sort.js";

const workItemIcons: {
  "User Story": string;
  Bug: string;
  "Small Works": string;
} = {
  "User Story": "📖",
  Bug: "🐞",
  "Small Works": "⚒️",
};

function getWorkItemIcon(
  workItemType: "User Story" | "Bug" | "Small Works",
): string {
  try {
    return workItemIcons[workItemType] as string;
  } catch {
    return "❓";
  }
}

export const IterationWorkitems = ({
  workItems,
}: {
  workItems: IterationWorkItemsType[];
}) => {
  const { organisation, project } = useSettingsStore((state) => state);

  return (
    <div className="w-full">
      <h2>Workitems</h2>

      {workItems.length === 0 && (
        <div className="text-sm">
          <i>No workitems exist in this iteration</i>
        </div>
      )}

      {workItems.map((story) => {
        const noStoryPoints = !story.points;
        const isStoryActive = story.state === "Active";

        return (
          <div
            key={story.id}
            className="border-1 border-[#16292B] rounded-md mb-3 p-2 text-sm bg-[#1B3336] shadow-md"
          >
            <div className="flex flex-row gap-2">
              <div className="flex-0 min-w-20 text-nowrap">
                {story.type.icon}{" "}
                <a
                  href={`https://dev.azure.com/${organisation}/${project}/_workitems/edit/${story.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {story.id}
                </a>
              </div>
              <div className="flex-1">
                {story.createdAfterSprintStarted && (
                  <span
                    title="Created after sprint start"
                    className="cursor-default"
                  >
                    ⚠️{" "}
                  </span>
                )}
                {story.title}
              </div>
            </div>
            <div className="pl-22 my-2 bg-[#1F3D40]">
              <div className="flex flex-row gap-2 font-bold">
                <div className="flex-1">Tasks</div>
                <div className="min-w-12">Est.</div>
                <div className="min-w-12">Rem.</div>
                <div className="min-w-12">Comp.</div>
              </div>
              {story.children.length === 0 && (
                <div>
                  <i>
                    No tasks exist for this story within the current iteration
                  </i>
                </div>
              )}
              {story.children.map((task, taskIndex) => {
                const noCompletedHours =
                  ["Active", "Closed"].includes(task.state) && !task.completed;
                const isTaskActive = task.state === "Active";

                return (
                  <div
                    key={task.id}
                    className={`flex flex-row gap-2 ${Math.abs(taskIndex % 2) === 1 ? "bg-[#23474A]" : ""}`}
                  >
                    <div className="flex-0 min-w-16">
                      <a
                        href={`https://dev.azure.com/${organisation}/${project}/_workitems/edit/${task.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {task.id}
                      </a>
                    </div>
                    <div className="flex-1">
                      {task.createdAfterSprintStarted && (
                        <span
                          title="Created after sprint start"
                          className="cursor-default"
                        >
                          ⚠️{" "}
                        </span>
                      )}
                      {task.title}
                    </div>
                    <div>{task.assignedTo || "Unassigned"}</div>
                    <div
                      className={
                        isTaskActive
                          ? "bg-green-500 text-white min-w-24"
                          : "min-w-24"
                      }
                    >
                      {task.state}
                    </div>
                    <div
                      className={
                        task.overEstimate
                          ? "bg-amber-400 text-black min-w-12"
                          : "min-w-12"
                      }
                    >
                      {task.originalEstimate} hrs
                    </div>
                    <div className="min-w-12">{task.remaining} hrs</div>
                    <div
                      className={
                        noCompletedHours
                          ? "bg-red-500 text-white min-w-12"
                          : "min-w-12"
                      }
                    >
                      {task.completed} hrs
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-row gap-2">
              <div
                className={
                  isStoryActive
                    ? "bg-green-500 text-white flex-0 text-nowrap px-1"
                    : "flex-0 text-nowrap"
                }
                title={
                  story.activeBeforeSprintStarted
                    ? "Activated in an earlier sprint"
                    : ""
                }
              >
                {story.activeBeforeSprintStarted ? "⚠️ " : ""}
                {story.state}
              </div>
              <div
                className={
                  noStoryPoints
                    ? "bg-red-500 text-white flex-0 min-w-12 text-nowrap"
                    : "flex-0 min-w-12 text-nowrap"
                }
              >
                {story.points ?? "N/A"} pts
              </div>
              <div className="flex-0 text-nowrap">
                <strong>Assigned to: </strong>
                {story.assignedTo || "Unassigned"}
              </div>
              <div
                className={
                  story.createdAfterSprintStarted
                    ? "bg-red-500 text-white flex-0 text-nowrap"
                    : "flex-0 text-nowrap"
                }
              >
                <strong>Created: </strong>
                {story.createdDate.toUTCString()}
              </div>
              <div className="flex-1 text-right">
                <strong>Totals: </strong>
              </div>
              <div className="min-w-12">{story.totals.totalEstimated} hrs</div>
              <div className="min-w-12">{story.totals.totalRemaining} hrs</div>
              <div className="min-w-12">{story.totals.totalCompleted} hrs</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

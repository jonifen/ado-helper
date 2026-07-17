import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useSettingsStore } from "../../data/settings-store.js";
import { useWorkItemStore } from "../../data/workitem-store.js";
import { RichTextSections } from "../../components/rich-text-sections.js";
import type { WorkItemSummaryType } from "../../managers/workitem-manager-types.js";

function WorkItemSummaryCard({
  workItem,
  label,
}: {
  workItem: WorkItemSummaryType;
  label: string;
}) {
  const { organisation, project } = useSettingsStore((state) => state);

  return (
    <div className="border-1 border-[#16292B] rounded-md p-2 text-sm bg-[#1B3336] shadow-md">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="flex flex-row gap-2 items-baseline">
        <div className="flex-0 min-w-16">
          <Link to={`/workitems/${workItem.id}`}>{workItem.id}</Link>{" "}
          <a
            href={`https://dev.azure.com/${organisation}/${project}/_workitems/edit/${workItem.id}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in Azure DevOps"
          >
            ↗
          </a>
        </div>
        <div className="flex-1">{workItem.title}</div>
        <div className="flex-0 text-nowrap">{workItem.type}</div>
        <div className="flex-0 text-nowrap">{workItem.state}</div>
        <div className="flex-0 text-nowrap">
          {workItem.assignedTo || "Unassigned"}
        </div>
      </div>
    </div>
  );
}

export function WorkItemDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error, loadWorkItem } = useWorkItemStore(
    (state) => state,
  );
  const { organisation, project } = useSettingsStore((state) => state);

  useEffect(() => {
    if (!id) return;
    loadWorkItem(Number(id));
  }, [id]);

  if (!id) return <div>No work item ID provided.</div>;

  if (loading)
    return (
      <div className="font-sans items-center justify-items-center min-h-screen px-8 py-3">
        Loading
      </div>
    );

  if (error)
    return (
      <div className="font-sans items-center justify-items-center min-h-screen px-8 py-3">
        <p className="text-red-500">Error loading work item {id}: {error}</p>
      </div>
    );

  if (!data) return null;

  return (
    <div className="font-sans items-center justify-items-center min-h-screen px-8 pb-3">
      <div className="flex flex-col gap-3 max-w-full">
        <div>
          <h2 className="text-2xl font-bold">
            {data.type} {data.id}: {data.title}
          </h2>
          <a
            href={`https://dev.azure.com/${organisation}/${project}/_workitems/edit/${data.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm underline"
          >
            Open in Azure DevOps ↗
          </a>
        </div>

        <div className="flex flex-row gap-8 text-sm w-fill">
          <div>
            <strong>State</strong><br />{data.state}
          </div>
          <div>
            <strong>Assigned to</strong><br />{data.assignedTo || "Unassigned"}
          </div>
          <div>
            <strong>Points</strong><br />{data.points ?? "N/A"}
          </div>
          <div>
            <strong>Original estimate</strong><br />
            {data.originalEstimate ?? "N/A"} hrs
          </div>
          <div>
            <strong>Remaining</strong><br />{data.remaining ?? "N/A"} hrs
          </div>
          <div>
            <strong>Completed</strong><br />{data.completed ?? "N/A"} hrs
          </div>
          <div>
            <strong>Iteration</strong><br />{data.iterationPath || "N/A"}
          </div>
        </div>

        {data.tags.length > 0 && (
          <div className="text-sm">
            <strong>Tags:</strong> {data.tags.join(", ")}
          </div>
        )}

        <div>
          <h3 className="text-lg font-bold">Parent</h3>
          {data.parent ? (
            <WorkItemSummaryCard workItem={data.parent} label="Parent" />
          ) : (
            <i className="text-sm">No parent work item</i>
          )}
        </div>

        <div>
          <h3 className="text-lg font-bold">Children</h3>
          {data.children.length === 0 && (
            <i className="text-sm">No child work items</i>
          )}
          <div className="flex flex-col gap-2">
            {data.children.map((child) => (
              <WorkItemSummaryCard
                key={child.id}
                workItem={child}
                label="Child"
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold">Description</h3>
          <RichTextSections
            html={data.description}
            emptyLabel="No description provided"
          />
        </div>

        <div>
          <h3 className="text-lg font-bold">Acceptance Criteria</h3>
          <RichTextSections
            html={data.acceptanceCriteria}
            emptyLabel="No acceptance criteria provided"
          />
        </div>
      </div>
    </div>
  );
}

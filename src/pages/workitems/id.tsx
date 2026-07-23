import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useSettingsStore } from "../../data/settings-store.js";
import { useWorkItemStore } from "../../data/workitem-store.js";
import { RichTextSections } from "../../components/rich-text-sections.js";
import { WorkItemTimeline } from "../../components/workitem-timeline.js";
import type { WorkItemSummaryType } from "../../managers/workitem-manager-types.js";
import { Tag } from "../../components/tag.js";

function WorkItemSummaryCard({
  workItem,
  label,
}: {
  workItem: WorkItemSummaryType;
  label: string;
}) {
  const { organisation, project } = useSettingsStore((state) => state);

  return (
    <div className="border-1 border-[#13172B] rounded-md p-2 text-sm bg-[#292E42] shadow-md">
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
        <div className="flex-0 text-nowrap">
          {workItem.type} &middot; {workItem.state} &middot; {workItem.assignedTo || "Unassigned"}
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
  const { pat, organisation, project } = useSettingsStore((state) => state);

  useEffect(() => {
    if (!id) return;
    loadWorkItem(Number(id));
  }, [id]);

  useEffect(() => {
    if (!data) return;
    document.title = `${data.type} ${data.id} (ADO Helper)`;
    return () => {
      document.title = "ADO Helper";
    };
  }, [data]);

  if (!pat || !organisation || !project) {
    return (
      <div className="font-sans items-center justify-items-center min-h-screen px-8 py-3">
        <p>
          Please go to the Settings page and enter your Personal Access Token,
          Organisation, and Project to use this tool.
        </p>
      </div>
    );
  }

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
            <strong className="text-[#9BCF69]">State</strong><br />{data.state}
          </div>
          <div>
            <strong className="text-[#9BCF69]">Assigned to</strong><br />{data.assignedTo || "Unassigned"}
          </div>
          <div>
            <strong className="text-[#9BCF69]">Points</strong><br />{data.points ?? "N/A"}
          </div>
          <div>
            <strong className="text-[#9BCF69]">Original estimate</strong><br />
            {data.originalEstimate ?? "N/A"} hrs
          </div>
          <div>
            <strong className="text-[#9BCF69]">Remaining</strong><br />{data.remaining ?? "N/A"} hrs
          </div>
          <div>
            <strong className="text-[#9BCF69]">Completed</strong><br />{data.completed ?? "N/A"} hrs
          </div>
          <div>
            <strong className="text-[#9BCF69]">Iteration</strong><br />{data.iterationPath || "N/A"}
          </div>
        </div>

        {data.tags.length > 0 && (
          <div className="text-sm">
            <strong className="text-[#9BCF69]">Tags:</strong> {data.tags.map((tag) => <Tag key={tag} value={tag} />)}
          </div>
        )}

        <WorkItemTimeline timeline={data.timeline} />

        <div>
          <h3 className="text-lg font-bold text-[#9BCF69]">Parent</h3>
          {data.parent ? (
            <WorkItemSummaryCard workItem={data.parent} label="Parent" />
          ) : (
            <i className="text-sm">No parent work item</i>
          )}
        </div>

        <div>
          <h3 className="text-lg font-bold text-[#9BCF69]">Children</h3>
          {data.children.length === 0 && (
            <i className="text-sm">No child work items</i>
          )}
          {data.children.length > 0 && (
            <div className="flex flex-col gap-2 border-1 border-[#33373C] rounded-md bg-[#33373C] shadow-md p-2" title="Child work items">
              {data.children.map((child) => (
                <WorkItemSummaryCard
                  key={child.id}
                  workItem={child}
                  label="Child"
                />
              ))}
            </div>)}
        </div>

        <div>
          <h3 className="text-lg font-bold text-[#9BCF69]">Description</h3>
          <div
            className="border-1 border-[#33373C] rounded-md bg-[#33373C] shadow-md p-2"
            title="Description"
          >
            <RichTextSections
              html={data.description}
              emptyLabel="No description provided"
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-[#9BCF69]">Acceptance Criteria</h3>
          <div
            className="border-1 border-[#33373C] rounded-md bg-[#33373C] shadow-md p-2"
            title="Acceptance Criteria"
          >
            <RichTextSections
              html={data.acceptanceCriteria}
              emptyLabel="No acceptance criteria provided"
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-[#9BCF69]">Comments</h3>
          {data.comments.length === 0 ? (
            <i className="text-sm">No comments</i>
          ) : (
            <div className="flex flex-col gap-2">
              {data.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="border-1 border-[#33373C] rounded-md bg-[#33373C] shadow-md p-2"
                >
                  <div className="text-xs text-gray-400 mb-1">
                    <strong>{comment.author}</strong>{" "}
                    &middot; {comment.createdDate.toLocaleString()}
                  </div>
                  <RichTextSections
                    html={comment.html}
                    emptyLabel="No comment text"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

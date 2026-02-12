import type { IterationDataType } from "../managers/iterations-manager-types.js";

export function generateCsv(data: IterationDataType): string {
  type WorkItem = (typeof data.workItems)[number];
  function flattenWorkItems(
    wi: WorkItem,
    parentId: string = "",
  ): Record<string, any>[] {
    function formatDateUTC(date: Date): string {
      if (!(date instanceof Date)) date = new Date(date);
      const yyyy = date.getUTCFullYear();
      const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
      const dd = String(date.getUTCDate()).padStart(2, "0");
      const hh = String(date.getUTCHours()).padStart(2, "0");
      const min = String(date.getUTCMinutes()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
    }
    const row = {
      ID: wi.id,
      Parent: parentId,
      Title: wi.title,
      WorkItemType: wi.type.name,
      State: wi.state,
      AssignedTo: wi.assignedTo || "Unassigned",
      CreatedDate: formatDateUTC(wi.createdDate),
      CreatedAfterSprintStarted: wi.createdAfterSprintStarted ? "Yes" : "",
      ActiveBeforeSprintStarted: wi.activeBeforeSprintStarted ? "Yes" : "",
      Points: wi.points || "",
      OriginalEstimate: wi.originalEstimate || 0,
      RemainingWork: wi.remaining || 0,
      Completed: wi.completed || 0,
    };
    let rows: Record<string, any>[] = [row];
    if (wi.children && wi.children.length > 0) {
      for (const child of wi.children) {
        rows = rows.concat(flattenWorkItems(child, String(wi.id)));
      }
    }
    return rows;
  }

  const thedata: Record<string, any>[] = data.workItems.flatMap(
    (wi: WorkItem) =>
      flattenWorkItems(wi, wi.parentId ? String(wi.parentId) : ""),
  );

  const headers = Object.keys(thedata[0] || {}).join(",");
  const rows = thedata
    .map((row: Record<string, any>) =>
      Object.values(row)
        .map((value) => `"${value}"`)
        .join(","),
    )
    .join("\n");

  return `${headers}\n${rows}`;
}

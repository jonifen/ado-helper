import type { WorkItemDataType } from "../data/api/workitems-types.js";

export function sortWorkItemsByState(workItems: WorkItemDataType[]) {
  return workItems.sort((a: WorkItemDataType, b: WorkItemDataType) => {
    const order = ["Active", "Ready", "New", "Resolved", "Closed"];
    const aState = a.fields["System.State"];
    const bState = b.fields["System.State"];
    const aIndex = order.indexOf(aState);
    const bIndex = order.indexOf(bState);
    return (
      (aIndex === -1 ? order.length : aIndex) -
      (bIndex === -1 ? order.length : bIndex)
    );
  });
}

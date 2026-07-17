import { create } from "zustand";
import type { WorkItemDetailType } from "../managers/workitem-manager-types.js";
import { getWorkItemDetail } from "../managers/workitem-manager.js";

type WorkItemStoreType = {
  workItemId: number | null;
  data: WorkItemDetailType | null;
  loading: boolean;
  error: string | null;
  loadWorkItem: (workItemId: number) => Promise<void>;
};

export const useWorkItemStore = create<WorkItemStoreType>()((set) => ({
  workItemId: null,
  data: null,
  loading: false,
  error: null,
  loadWorkItem: async (workItemId: number) => {
    set(() => ({ loading: true, error: null }));
    try {
      const data = await getWorkItemDetail(workItemId);
      set(() => ({ workItemId, data, loading: false }));
    } catch (error) {
      set(() => ({
        workItemId,
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }));
    }
  },
}));

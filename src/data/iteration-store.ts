import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as localforage from "localforage";
import type { IterationDataType } from "../managers/iterations-manager-types.js";
import { getIterationData } from "../managers/iterations-manager.js";

type IterationStoreType = {
  iterationId: string;
  teamId: string;
  data: IterationDataType;
  lastUpdated: Date;
  refreshing: boolean;
  loadIteration: (teamId: string, iterationId: string) => void;
  refreshIteration: (teamId: string, iterationId: string) => void;
};

function getIterationDbKey(teamId: string, iterationId: string) {
  return `${teamId}/iteration/${iterationId}`;
}

export const useIterationStore = create<IterationStoreType>()(
  persist(
    (set, get) => ({
      iterationId: "",
      teamId: "",
      data: {} as IterationDataType,
      lastUpdated: new Date(),
      refreshing: false,
      loadIteration: async (teamId, iterationId) => {
        const key = getIterationDbKey(teamId, iterationId);
        const storedValue = await localforage.getItem<IterationStoreType>(key);

        if (storedValue) {
          set(() => ({
            ...storedValue,
            teamId: teamId,
            iterationId: iterationId,
            data: storedValue?.data || ({} as IterationDataType),
            lastUpdated: storedValue
              ? new Date(storedValue.lastUpdated)
              : new Date(),
            refreshing: false,
          }));
        } else {
          await get().refreshIteration(teamId, iterationId);
        }
      },
      refreshIteration: async (teamId, iterationId) => {
        set(() => ({
          refreshing: true,
        }));
        const newValue = await getIterationData(teamId, iterationId);
        set(() => ({
          teamId: teamId,
          iterationId: iterationId,
          data: newValue || ({} as IterationDataType),
          lastUpdated: new Date(),
          refreshing: false,
        }));
      },
    }),
    {
      name: "iteration",
      storage: {
        getItem: async (name: string) => {
          // const storedValue =
          //   await localforage.getItem<IterationStoreType>(name);
          // return {
          //   state: {
          //     ...storedValue,
          //     teamId: storedValue ? storedValue.teamId : "",
          //     iterationId: storedValue ? storedValue.iterationId : "",
          //     data: Array.isArray(storedValue?.data) ? storedValue.data : [],
          //     lastUpdated: storedValue
          //       ? new Date(storedValue.lastUpdated)
          //       : new Date(),
          //   },
          // };
        },
        setItem: async (name: string, value: { state: IterationStoreType }) => {
          const key = getIterationDbKey(
            value.state.teamId,
            value.state.iterationId,
          );
          await localforage.setItem(key, {
            teamId: value.state.teamId,
            iterationId: value.state.iterationId,
            data: value.state.data,
            lastUpdated: value.state.lastUpdated,
          });
        },
        removeItem: async (name: string) => {
          // I don't need this right now, but including to satisfy the interface
        },
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Error during hydration: ", error);
        }
      },
    },
  ),
);

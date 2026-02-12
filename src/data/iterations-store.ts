import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as localforage from "localforage";
import type { IterationsValueType } from "./api/iterations-types.js";
import { getIterations } from "./api/iterations.js";

type IterationsStoreType = {
  teamId: string;
  iterations: IterationsValueType[];
  lastUpdated: Date;
  loadingIterations: boolean;
  loadIterations: (teamId: string) => void;
  refreshIterations: (teamId: string) => void;
};

function getIterationsDbKey(teamId: string) {
  return `${teamId}/iterations`;
}

export const useIterationsStore = create<IterationsStoreType>()(
  persist(
    (set) => ({
      teamId: "",
      iterations: [],
      lastUpdated: new Date(),
      loadingIterations: false,
      loadIterations: async (teamId: string) => {
        const key = getIterationsDbKey(teamId);
        const storedValue = await localforage.getItem<IterationsStoreType>(key);

        if (storedValue) {
          set(() => ({
            ...storedValue,
            teamId: teamId,
            iterations: Array.isArray(storedValue.iterations)
              ? storedValue.iterations
              : [],
            lastUpdated: storedValue
              ? new Date(storedValue.lastUpdated)
              : new Date(),
            loadingIterations: false,
          }));
        }
      },
      refreshIterations: async (teamId: string) => {
        set(() => ({
          loadingIterations: true,
        }));
        const getIterationsResponse = await getIterations(teamId);
        set(() => ({
          teamId: teamId,
          iterations: getIterationsResponse.value,
          lastUpdated: new Date(),
          loadingIterations: false,
        }));
      },
    }),
    {
      name: "iterations",
      storage: {
        getItem: async (name: string) => {
          // const key = getIterationsDbKey(name);
          // const storedValue =
          //   await localforage.getItem<IterationsStoreType>(key);
          // return {
          //   state: {
          //     ...storedValue,
          //     teamId: storedValue ? storedValue.teamId : "",
          //     iterations: Array.isArray(storedValue?.iterations) ? storedValue.iterations : [],
          //     lastUpdated: storedValue
          //       ? new Date(storedValue.lastUpdated)
          //       : new Date(),
          //   },
          // };
        },
        setItem: async (
          name: string,
          value: { state: IterationsStoreType },
        ) => {
          const key = getIterationsDbKey(value.state.teamId);
          await localforage.setItem(key, {
            teamId: value.state.teamId,
            iterations: value.state.iterations,
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

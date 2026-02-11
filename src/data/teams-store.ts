import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as localforage from "localforage";
import type { GetTeamType } from "./api/teams-types.js";

type TeamsStoreType = {
  teams: GetTeamType[];
  lastUpdated: Date;
  saveTeams: (settings: Partial<TeamsStoreType>) => void;
};

export const useTeamsStore = create<TeamsStoreType>()(
  persist(
    (set) => ({
      teams: [],
      lastUpdated: new Date(),
      saveTeams: (teams: Partial<TeamsStoreType>) =>
        set(() => ({
          ...teams,
          lastUpdated: new Date(),
        })),
    }),
    {
      name: "teams",
      storage: {
        getItem: async (name: string) => {
          const storedValue = await localforage.getItem<TeamsStoreType>(name);
          return {
            state: {
              ...storedValue,
              teams: [...(storedValue ? storedValue.teams : [])],
            },
          };
        },
        setItem: async (name: string, value: { state: TeamsStoreType }) => {
          await localforage.setItem(name, {
            teams: [...value.state.teams],
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

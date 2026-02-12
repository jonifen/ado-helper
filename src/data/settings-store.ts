import { create } from "zustand";
import { persist } from "zustand/middleware";

type SettingsStoreType = {
  pat: string;
  organisation: string;
  project: string;
  saveSettings: (settings: Partial<SettingsStoreType>) => void;
};

export const useSettingsStore = create<SettingsStoreType>()(
  persist(
    (set) => ({
      pat: "",
      organisation: "",
      project: "",
      saveSettings: (settings: Partial<SettingsStoreType>) => {
        set(() => ({
          ...settings,
        }));
      },
    }),
    {
      name: "settings",
      storage: {
        getItem: (name: string) => {
          const storedValue = localStorage.getItem(name);
          if (!storedValue) {
            return {
              state: {
                pat: "",
                organisation: "",
                project: "",
              },
            };
          }

          const settings = JSON.parse(storedValue);

          return {
            state: {
              ...settings,
            },
          };
        },
        setItem: (name: string, value: any) => {
          const valueToStore = JSON.stringify(value.state);
          localStorage.setItem(name, valueToStore);
        },
        removeItem: (name: string) => {
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

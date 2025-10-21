import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  UserSettings,
  PreferenceExternalization,
} from "@/services/SettingsService";

interface SettingsState {
  unsavedChanges: Record<string, any>;
  setUnsavedChanges: (tab: string, changes: any) => void;
  clearUnsavedChanges: (tab: string) => void;
  generalSettings: Partial<UserSettings> | null;
  setGeneralSettings: (settings: Partial<UserSettings>) => void;
  integrations: PreferenceExternalization[];
  setIntegrations: (integrations: PreferenceExternalization[]) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      unsavedChanges: {},
      setUnsavedChanges: (tab, changes) =>
        set((state) => ({
          unsavedChanges: {
            ...state.unsavedChanges,
            [tab]: changes,
          },
        })),
      clearUnsavedChanges: (tab) =>
        set((state) => {
          const { [tab]: _, ...rest } = state.unsavedChanges;
          return { unsavedChanges: rest };
        }),
      generalSettings: null,
      setGeneralSettings: (settings) => set({ generalSettings: settings }),
      integrations: [],
      setIntegrations: (integrations) => set({ integrations }),
    }),
    {
      name: "settings-storage",
    },
  ),
);

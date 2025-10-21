import { create } from "zustand";

export interface LanguageState {
  preferredLanguage: string;
  supportedLanguages: string[];
  setPreferredLanguage: (lang: string) => void;
  setSupportedLanguages: (languages: string[]) => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  preferredLanguage: "en",
  supportedLanguages: ["en", "es", "fr", "zh", "hi"],
  setPreferredLanguage: (lang: string) => set({ preferredLanguage: lang }),
  setSupportedLanguages: (languages: string[]) =>
    set({ supportedLanguages: languages }),
}));

export const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  zh: "中文",
  hi: "हिन्दी",
};

export const getLanguageName = (code: string): string => {
  return LANGUAGE_NAMES[code] || code;
};

import { create } from "zustand";

interface LanguageState {
  currentLanguage: string;
  supportedLanguages: { code: string; name: string }[];
  setCurrentLanguage: (language: string) => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  currentLanguage: typeof window !== 'undefined' ? localStorage.getItem("preferredLanguage") || "en" : "en",
  supportedLanguages: [
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "fr", name: "Français" },
    { code: "de", name: "Deutsch" },
    { code: "it", name: "Italiano" },
    { code: "pt", name: "Português" },
    { code: "ja", name: "日本語" },
    { code: "ko", name: "한국어" },
    { code: "zh", name: "中文" },
  ],
  setCurrentLanguage: (language: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("preferredLanguage", language);
    }
    set({ currentLanguage: language });
  },
}));

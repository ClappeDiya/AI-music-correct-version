"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import useTranslation from "next-translate/useTranslation";
import { trpc } from "@/lib/trpc";

type LanguageContextType = {
  currentLanguage: string;
  setLanguage: (language: string) => Promise<void>;
  languages: { code: string; name: string }[];
  t: (key: string, params?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: "en",
  setLanguage: async () => {},
  languages: [
    { code: "en", name: "English" },
    { code: "fr", name: "Français" },
    { code: "es", name: "Español" },
    { code: "de", name: "Deutsch" },
    { code: "zh", name: "中文" },
  ],
  t: (key: string) => key,
});

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { t } = useTranslation("common");
  const pathname = usePathname();
  const router = useRouter();
  const [currentLanguage, setCurrentLanguage] = useState(
    pathname?.split("/")[1] || "en",
  );
  const setLanguageMutation = trpc.languages.setLanguage.useMutation();

  const setLanguage = async (language: string) => {
    try {
      await setLanguageMutation.mutateAsync({ language });
      setCurrentLanguage(language);
      router.push(pathname?.replace(/^\/[^\/]+/, `/${language}`) || "/");
    } catch (error) {
      console.error("Failed to set language:", error);
    }
  };

  useEffect(() => {
    const newLanguage = pathname?.split("/")[1];
    if (newLanguage && newLanguage !== currentLanguage) {
      setCurrentLanguage(newLanguage);
    }
  }, [pathname]);

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        t,
        languages: [
          { code: "en", name: t("languages.en") },
          { code: "fr", name: t("languages.fr") },
          { code: "es", name: t("languages.es") },
          { code: "de", name: t("languages.de") },
          { code: "zh", name: t("languages.zh") },
        ],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

import { useCallback } from "react";
import { Check, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "next-i18next";

interface Language {
  code: string;
  name: string;
  flag?: string;
}

interface LanguageSelectorProps {
  currentLanguage: string;
  languages: Language[];
  onLanguageChange: (code: string) => void;
  className?: string;
}

export function LanguageSelector({
  currentLanguage,
  languages,
  onLanguageChange,
  className = "",
}: LanguageSelectorProps) {
  const { t } = useTranslation();

  const handleLanguageSelect = useCallback(
    (code: string) => {
      onLanguageChange(code);
    },
    [onLanguageChange],
  );

  const getCurrentLanguageName = useCallback(() => {
    const current = languages.find((lang) => lang.code === currentLanguage);
    return current?.name || currentLanguage;
  }, [currentLanguage, languages]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`flex items-center gap-2 ${className}`}
        >
          <Globe className="h-4 w-4" />
          <span>{getCurrentLanguageName()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            className="flex items-center justify-between"
            onClick={() => handleLanguageSelect(language.code)}
          >
            <span className="flex items-center gap-2">
              {language.flag && <span>{language.flag}</span>}
              {language.name}
            </span>
            {currentLanguage === language.code && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

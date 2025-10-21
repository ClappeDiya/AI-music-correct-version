import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/useToast";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import { Globe, Check } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

interface LocaleMappings {
  [key: string]: string;
}

interface ValueMappings {
  [category: string]: {
    [locale: string]: {
      [key: string]: string;
    };
  };
}

export function TranslingualPreferences() {
  const [supportedLocales, setSupportedLocales] = useState<string[]>([]);
  const [currentLocale, setCurrentLocale] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    fetchSupportedLocales();
    setCurrentLocale(i18n.language);
  }, []);

  const fetchSupportedLocales = async () => {
    try {
      const response = await fetch(
        "/api/settings/translingualpreference/supported_locales/",
      );
      const data = await response.json();
      setSupportedLocales(data.locales);
    } catch (error) {
      console.error("Error fetching supported locales:", error);
    }
  };

  const handleLocaleChange = async (newLocale: string) => {
    if (newLocale === currentLocale) return;

    setIsUpdating(true);
    try {
      // First, store current preferences in universal format
      const userSettings = await fetch(
        "/api/settings/usersettings/current/",
      ).then((r) => r.json());

      await fetch("/api/settings/translingualpreference/store_preferences/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          preferences: userSettings.preferences,
          locale: currentLocale,
        }),
      });

      // Then update to new locale
      await fetch("/api/settings/translingualpreference/update_locale/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locale: newLocale,
        }),
      });

      // Update Next.js locale
      await router.push(router.pathname, router.asPath, { locale: newLocale });

      setCurrentLocale(newLocale);

      toast({
        title: t("Locale Updated"),
        description: t(
          "Your preferences have been updated for the new language",
        ),
      });
    } catch (error) {
      console.error("Error updating locale:", error);
      toast({
        title: t("Update Failed"),
        description: t("Failed to update preferences for new language"),
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getLocaleName = (locale: string) => {
    const names: { [key: string]: string } = {
      en: "English",
      es: "Español",
      fr: "Français",
      // Add more locale names as needed
    };
    return names[locale] || locale;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <div>
              <CardTitle>{t("Language Preferences")}</CardTitle>
              <CardDescription>
                {t(
                  "Your preferences will be automatically adapted for each language",
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("Select Language")}</Label>
              <Select
                value={currentLocale}
                onValueChange={handleLocaleChange}
                disabled={isUpdating}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder={t("Select a language")} />
                </SelectTrigger>
                <SelectContent>
                  {supportedLocales.map((locale) => (
                    <SelectItem key={locale} value={locale}>
                      <div className="flex items-center justify-between w-full">
                        <span>{getLocaleName(locale)}</span>
                        {locale === currentLocale && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md bg-muted p-4">
              <div className="flex items-start space-x-2">
                <div>
                  <p className="text-sm font-medium">
                    {t("Current Language")}: {getLocaleName(currentLocale)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t(
                      "Your preferences are automatically translated and adapted for each language",
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

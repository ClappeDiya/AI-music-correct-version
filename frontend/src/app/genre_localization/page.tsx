import { GenreLocalizationTable } from "@/components/genre-localization/GenreLocalizationTable";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/componen../ui/card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { useTranslations } from "@/hooks/usetranslations";
import { Plus } from "lucide-react";

export default function GenreLocalizationPage() {
  const translationsQuery = useTranslations();

  if (translationsQuery.isLoading) {
    return <div>Loading translations...</div>;
  }

  if (translationsQuery.error) {
    return <div>Error loading translations</div>;
  }

  // Create a lookup map for translations using original_text as key
  const translationsMap = new Map(
    translationsQuery.data?.map((t) => [t.original_text, t.translated_text]) ||
      [],
  );

  // Translation function
  const t = (key: string) => translationsMap.get(key) || key;

  return (
    <div className="container mx-auto py-4 md:py-8">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 md:mb-8 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">
          {t("genreLocalization.title")}
        </h1>
        <Button className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          {t("genreLocalization.addLocalization")}
        </Button>
      </div>

      <div className="grid gap-6 md:gap-8">
        <Card variant="outline">
          <CardHeader spacing="sm">
            <CardTitle>{t("genreLocalization.manageLocalizations")}</CardTitle>
          </CardHeader>
          <CardContent>
            <GenreLocalizationTable />
          </CardContent>
        </Card>

        <Card variant="outline">
          <CardHeader spacing="sm">
            <CardTitle>{t("genreLocalization.fallbackSettings")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>{t("genreLocalization.defaultLanguage")}</Label>
              <Select>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue
                    placeholder={t("genreLocalization.selectLanguage")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>{t("genreLocalization.fallbackStrategy")}</Label>
              <Select>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue
                    placeholder={t("genreLocalization.selectStrategy")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">
                    {t("genreLocalization.useDefaultLanguage")}
                  </SelectItem>
                  <SelectItem value="original">
                    {t("genreLocalization.useOriginalName")}
                  </SelectItem>
                  <SelectItem value="custom">
                    {t("genreLocalization.useCustomFallback")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>{t("genreLocalization.customFallbackText")}</Label>
              <Input placeholder={t("genreLocalization.enterFallbackText")} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

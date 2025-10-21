import { useState, useCallback } from "react";
import { useTranslation } from "next-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Save, Loader2 } from "lucide-react";

interface TranslationField {
  key: string;
  defaultValue: string;
  translatedValue: string;
}

interface TranslationManagerProps {
  contentType: string;
  contentId: string;
  fields: TranslationField[];
  languages: { code: string; name: string }[];
  currentLanguage: string;
  onSave: (translations: { [key: string]: string }) => Promise<void>;
  isLoading?: boolean;
}

export function TranslationManager({
  contentType,
  contentId,
  fields,
  languages,
  currentLanguage,
  onSave,
  isLoading = false,
}: TranslationManagerProps) {
  const { t } = useTranslation();
  const [translations, setTranslations] = useState<{ [key: string]: string }>(
    Object.fromEntries(
      fields.map((field) => [field.key, field.translatedValue]),
    ),
  );
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = useCallback((key: string, value: string) => {
    setTranslations((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }, []);

  const handleSave = useCallback(async () => {
    try {
      await onSave(translations);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save translations",
      );
    }
  }, [translations, onSave]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("Manage Translations")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label>{field.key}</Label>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm text-muted-foreground">
                    {t("Original")}
                  </Label>
                  <Textarea
                    value={field.defaultValue}
                    readOnly
                    className="mt-1 bg-muted"
                  />
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    {t("Translation")}
                  </Label>
                  <Textarea
                    value={translations[field.key] || ""}
                    onChange={(e) =>
                      handleInputChange(field.key, e.target.value)
                    }
                    className="mt-1"
                    placeholder={t("Enter translation")}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {t("Save Translations")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

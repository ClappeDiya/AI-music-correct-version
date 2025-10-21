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
import { Switch } from "@/components/ui/Switch";
import { Label } from "@/components/ui/Label";
import {
  ArrowUpFromLine,
  FileJson,
  Shield,
  Check,
  Download,
} from "lucide-react";
import { useTranslation } from "next-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";

interface ExportFormat {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const EXPORT_FORMATS: ExportFormat[] = [
  {
    id: "w3c_did",
    name: "W3C DID Format",
    description:
      "Decentralized Identifiers (DIDs) compliant format for maximum interoperability",
    icon: <Shield className="h-5 w-5" />,
  },
];

export function UniversalProfileExport() {
  const [selectedFormat, setSelectedFormat] = useState<string>("w3c_did");
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportedData, setExportedData] = useState<any>(null);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(
        "/api/settings/universalprofilemapping/export_preferences/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            format_type: selectedFormat,
            include_metadata: includeMetadata,
          }),
        },
      );

      if (!response.ok) throw new Error("Export failed");

      const data = await response.json();
      setExportedData(data);

      toast({
        title: t("Export Successful"),
        description: t("Your preferences have been exported successfully"),
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: t("Export Failed"),
        description: t("Failed to export preferences"),
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const downloadExport = () => {
    if (!exportedData) return;

    const blob = new Blob(
      [JSON.stringify(exportedData.portable_format, null, 2)],
      {
        type: "application/json",
      },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `preferences-export-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <ArrowUpFromLine className="h-5 w-5" />
            <div>
              <CardTitle>{t("Export Preferences")}</CardTitle>
              <CardDescription>
                {t(
                  "Export your preferences in a universal format for use with other services",
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>{t("Export Format")}</Label>
              <Select
                value={selectedFormat}
                onValueChange={setSelectedFormat}
                disabled={isExporting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("Select export format")} />
                </SelectTrigger>
                <SelectContent>
                  {EXPORT_FORMATS.map((format) => (
                    <SelectItem key={format.id} value={format.id}>
                      <div className="flex items-center space-x-2">
                        {format.icon}
                        <div>
                          <p className="font-medium">{format.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {format.description}
                          </p>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="metadata"
                checked={includeMetadata}
                onCheckedChange={setIncludeMetadata}
                disabled={isExporting}
              />
              <Label htmlFor="metadata">
                {t("Include metadata (recommended)")}
              </Label>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="flex-1"
              >
                {isExporting ? (
                  <div className="flex items-center space-x-2">
                    <span>{t("Exporting...")}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <ArrowUpFromLine className="h-4 w-4" />
                    <span>{t("Export")}</span>
                  </div>
                )}
              </Button>

              {exportedData && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <FileJson className="h-4 w-4 mr-2" />
                      {t("Preview")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>{t("Exported Preferences")}</DialogTitle>
                      <DialogDescription>
                        {t("Preview of your exported preferences in")}{" "}
                        {selectedFormat} {t("format")}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                      <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96">
                        <code>
                          {JSON.stringify(
                            exportedData.portable_format,
                            null,
                            2,
                          )}
                        </code>
                      </pre>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button onClick={downloadExport}>
                        <Download className="h-4 w-4 mr-2" />
                        {t("Download")}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

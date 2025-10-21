import { useCallback } from "react";
import { useTranslation } from "next-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Badge } from "@/components/ui/Badge";
import { Plus, Minus, Equal } from "lucide-react";

interface DiffLine {
  type: "added" | "removed" | "unchanged";
  content: string;
}

interface DiffSection {
  key: string;
  title: string;
  lines: DiffLine[];
}

interface SnapshotDiffProps {
  fromVersion: number;
  toVersion: number;
  sections: DiffSection[];
}

export function SnapshotDiff({
  fromVersion,
  toVersion,
  sections,
}: SnapshotDiffProps) {
  const { t } = useTranslation();

  const renderDiffLine = useCallback((line: DiffLine) => {
    const icon = {
      added: <Plus className="h-4 w-4 text-green-500" />,
      removed: <Minus className="h-4 w-4 text-red-500" />,
      unchanged: <Equal className="h-4 w-4 text-gray-400" />,
    }[line.type];

    const bgColor = {
      added: "bg-green-50 dark:bg-green-950",
      removed: "bg-red-50 dark:bg-red-950",
      unchanged: "",
    }[line.type];

    return (
      <div className={`flex items-start gap-2 p-1 ${bgColor}`}>
        {icon}
        <pre className="flex-1 whitespace-pre-wrap font-mono text-sm">
          {line.content}
        </pre>
      </div>
    );
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t("Content Changes")}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">v{fromVersion}</Badge>
            <span>→</span>
            <Badge variant="outline">v{toVersion}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-6">
            {sections.map((section) => (
              <div key={section.key} className="space-y-2">
                <h3 className="font-medium">{section.title}</h3>
                <div className="rounded-lg border">
                  {section.lines.map((line, index) => (
                    <div key={index}>{renderDiffLine(line)}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

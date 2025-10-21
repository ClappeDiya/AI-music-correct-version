import { useState, useCallback } from "react";
import { useTranslation } from "next-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Camera, History, ArrowLeftRight, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Snapshot {
  id: string;
  version: number;
  createdAt: string;
  createdBy: string;
  comment?: string;
}

interface SnapshotManagerProps {
  contentType: string;
  contentId: string;
  snapshots: Snapshot[];
  onCreateSnapshot: (comment: string) => Promise<void>;
  onCompareSnapshots: (fromId: string, toId: string) => Promise<void>;
  isLoading?: boolean;
}

export function SnapshotManager({
  contentType,
  contentId,
  snapshots,
  onCreateSnapshot,
  onCompareSnapshots,
  isLoading = false,
}: SnapshotManagerProps) {
  const { t } = useTranslation();
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedSnapshots, setSelectedSnapshots] = useState<string[]>([]);

  const handleCreateSnapshot = useCallback(async () => {
    try {
      await onCreateSnapshot(comment);
      setComment("");
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create snapshot",
      );
    }
  }, [comment, onCreateSnapshot]);

  const handleSnapshotSelect = useCallback((id: string) => {
    setSelectedSnapshots((prev) => {
      if (prev.includes(id)) {
        return prev.filter((s) => s !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id];
      }
      return [...prev, id];
    });
  }, []);

  const handleCompare = useCallback(async () => {
    if (selectedSnapshots.length !== 2) return;
    try {
      await onCompareSnapshots(selectedSnapshots[0], selectedSnapshots[1]);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to compare snapshots",
      );
    }
  }, [selectedSnapshots, onCompareSnapshots]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("Content Snapshots")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>{t("Snapshot Comment")}</Label>
              <Input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t("Enter a comment for this snapshot")}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleCreateSnapshot}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
                {t("Create Snapshot")}
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>{t("Version")}</TableHead>
                <TableHead>{t("Created At")}</TableHead>
                <TableHead>{t("Created By")}</TableHead>
                <TableHead>{t("Comment")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {snapshots.map((snapshot) => (
                <TableRow key={snapshot.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedSnapshots.includes(snapshot.id)}
                      onChange={() => handleSnapshotSelect(snapshot.id)}
                      className="rounded border-gray-300"
                      aria-label={t("Select snapshot version {{version}}", {
                        version: snapshot.version,
                      })}
                    />
                  </TableCell>
                  <TableCell>v{snapshot.version}</TableCell>
                  <TableCell>
                    {format(new Date(snapshot.createdAt), "PPpp")}
                  </TableCell>
                  <TableCell>{snapshot.createdBy}</TableCell>
                  <TableCell>{snapshot.comment}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {selectedSnapshots.length === 2 && (
            <div className="flex justify-end">
              <Button
                onClick={handleCompare}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeftRight className="h-4 w-4" />
                {t("Compare Selected")}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

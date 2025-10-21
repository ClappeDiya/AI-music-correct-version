"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/componen../ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/Table";
import { useToast } from "@/components/ui/usetoast";
import { ProfileHistory } from "@/lib/types";
import ExportSettingsButton from "./ExportSettingsButton";

interface ProfileHistoryViewProps {
  profileId: string;
  history: ProfileHistory[];
  onRestore?: () => void;
}

export default function ProfileHistoryView({
  profileId,
  history,
  onRestore,
}: ProfileHistoryViewProps) {
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleRestore = async (historyId: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/settings/profile-history/${historyId}/restore`,
        {
          method: "POST",
        },
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "Profile version restored",
        });
        onRestore?.();
      } else {
        throw new Error(response.statusText);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to restore profile version",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile History</CardTitle>
        <CardDescription>
          View and restore previous versions of this profile
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Version</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>v{entry.version}</TableCell>
                <TableCell>
                  {new Date(entry.created_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedVersion(entry.id)}
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    className="ml-2"
                    onClick={() => handleRestore(entry.id)}
                    disabled={loading}
                  >
                    Restore
                  </Button>
                  <ExportSettingsButton
                    profileId={profileId}
                    historyId={entry.id}
                    className="ml-2"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {selectedVersion && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h3 className="font-semibold mb-2">Version Details</h3>
            <pre className="text-sm">
              {JSON.stringify(
                history.find((h) => h.id === selectedVersion)
                  ?.settings_snapshot,
                null,
                2,
              )}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

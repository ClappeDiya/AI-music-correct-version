"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/componen../ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/usetoast";

interface Snapshot {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  data: Record<string, any>;
}

export default function SnapshotsPage() {
  const { toast } = useToast();
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [snapshotName, setSnapshotName] = useState("");
  const [snapshotDescription, setSnapshotDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [restoringSnapshotId, setRestoringSnapshotId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    fetchSnapshots();
  }, []);

  const fetchSnapshots = async () => {
    try {
      const response = await fetch("/api/snapshots", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.status === 401) {
        // Redirect to login if unauthorized
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch snapshots");
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        setSnapshots(data);
      } else {
        throw new Error("Invalid snapshots data format");
      }
    } catch (error) {
      setSnapshots([]);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to fetch snapshots",
        variant: "destructive",
      });
    }
  };

  const handleCreateSnapshot = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/snapshots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: snapshotName,
          description: snapshotDescription,
        }),
      });

      if (!response.ok) throw new Error("Failed to create snapshot");

      await fetchSnapshots();
      setIsCreateDialogOpen(false);
      setSnapshotName("");
      setSnapshotDescription("");
      toast({
        title: "Success",
        description: "Snapshot created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create snapshot",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSnapshot = async (id: string) => {
    try {
      const response = await fetch("/api/snapshots", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error("Failed to delete snapshot");

      await fetchSnapshots();
      toast({
        title: "Success",
        description: "Snapshot deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete snapshot",
        variant: "destructive",
      });
    }
  };

  const handleRestoreSnapshot = async (id: string) => {
    setRestoringSnapshotId(id);
    try {
      const response = await fetch("/api/snapshots", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error("Failed to restore snapshot");

      toast({
        title: "Success",
        description: "Snapshot restored successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to restore snapshot",
        variant: "destructive",
      });
    } finally {
      setRestoringSnapshotId(null);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Environment Snapshots</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          Create Snapshot
        </Button>
      </div>

      <div className="grid gap-4">
        {snapshots.map((snapshot) => (
          <Card key={snapshot.id}>
            <CardHeader>
              <CardTitle>{snapshot.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {new Date(snapshot.createdAt).toLocaleString()}
              </p>
            </CardHeader>
            <CardContent>
              <p>{snapshot.description}</p>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => handleRestoreSnapshot(snapshot.id)}
                  disabled={restoringSnapshotId === snapshot.id}
                >
                  {restoringSnapshotId === snapshot.id
                    ? "Restoring..."
                    : "Restore"}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteSnapshot(snapshot.id)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Snapshot</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={snapshotName}
                onChange={(e) => setSnapshotName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={snapshotDescription}
                onChange={(e) => setSnapshotDescription(e.target.value)}
              />
            </div>
            <Button onClick={handleCreateSnapshot} disabled={isLoading}>
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

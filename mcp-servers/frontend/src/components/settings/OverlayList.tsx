"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import Link from "next/link";
import { Overlay } from "@/lib/types";
import { toast } from "@/components/ui/usetoast";

export function OverlayList() {
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverlays();
  }, []);

  const fetchOverlays = async () => {
    try {
      const response = await fetch("/api/settings/overlays");
      const data = await response.json();
      setOverlays(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch overlays",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await fetch(`/api/settings/overlays/${id}/activate`, {
        method: "POST",
      });
      toast({
        title: "Success",
        description: "Overlay activated",
      });
      fetchOverlays();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to activate overlay",
        variant: "destructive",
      });
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await fetch(`/api/settings/overlays/${id}/deactivate`, {
        method: "POST",
      });
      toast({
        title: "Success",
        description: "Overlay deactivated",
      });
      fetchOverlays();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to deactivate overlay",
        variant: "destructive",
      });
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Trigger Conditions</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {overlays.map((overlay) => (
          <TableRow key={overlay.id}>
            <TableCell>{overlay.name}</TableCell>
            <TableCell>{JSON.stringify(overlay.trigger_conditions)}</TableCell>
            <TableCell>{overlay.active ? "Active" : "Inactive"}</TableCell>
            <TableCell className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  overlay.active
                    ? handleDeactivate(overlay.id)
                    : handleActivate(overlay.id)
                }
              >
                {overlay.active ? "Deactivate" : "Activate"}
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/settings/overlays/${overlay.id}`}>Edit</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

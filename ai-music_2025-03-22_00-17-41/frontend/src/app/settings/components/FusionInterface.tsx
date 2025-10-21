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
import { UserProfile } from "@/lib/types";

interface FusionInterfaceProps {
  profiles: UserProfile[];
  onFusionComplete: () => void;
}

export default function FusionInterface({
  profiles,
  onFusionComplete,
}: FusionInterfaceProps) {
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const { toast } = useToast();

  const handleFusion = async () => {
    try {
      const response = await fetch("/api/settings/profile-fusions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source_profiles: selectedProfiles,
          fusion_parameters: {}, // Add any fusion parameters here
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create fusion");
      }

      toast({
        title: "Fusion created",
        description: "Your persona fusion is being processed",
      });

      onFusionComplete();
      setSelectedProfiles([]);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create fusion",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Persona Fusion</CardTitle>
        <CardDescription>
          Combine multiple profiles to create a new persona
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Select</TableHead>
                <TableHead>Profile Name</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedProfiles.includes(profile.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProfiles([
                            ...selectedProfiles,
                            profile.id,
                          ]);
                        } else {
                          setSelectedProfiles(
                            selectedProfiles.filter((id) => id !== profile.id),
                          );
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>{profile.name}</TableCell>
                  <TableCell>{profile.profile_type}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Button onClick={handleFusion} disabled={selectedProfiles.length < 2}>
            Create Fusion
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

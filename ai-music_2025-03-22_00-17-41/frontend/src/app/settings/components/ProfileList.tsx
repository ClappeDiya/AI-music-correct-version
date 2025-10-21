"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/Table";
import { useToast } from "@/components/ui/usetoast";
import {
  userPreferencesService,
  PreferenceProfile,
} from "../../../services/user-preferences";

interface ProfileListProps {
  onProfileSelect: (profileId: string) => void;
}

export default function ProfileList({ onProfileSelect }: ProfileListProps) {
  const [profiles, setProfiles] = useState<PreferenceProfile[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const response = await userPreferencesService.getProfiles();
      setProfiles(response.data);
    } catch (error) {
      console.error("Error loading profiles:", error);
      toast({
        title: "Error",
        description: "Failed to load profiles",
      });
    }
  };

  const handleActivate = async (profileId: string) => {
    try {
      await userPreferencesService.activateProfile(profileId);
      loadProfiles();
      toast({
        title: "Success",
        description: "Profile activated successfully",
      });
    } catch (error) {
      console.error("Error activating profile:", error);
      toast({
        title: "Error",
        description: "Failed to activate profile",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Profiles</CardTitle>
        <CardDescription>
          Manage your different preference profiles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.map((profile) => (
              <TableRow key={profile.id}>
                <TableCell
                  className="cursor-pointer hover:text-blue-600"
                  onClick={() => onProfileSelect(profile.id)}
                >
                  {profile.name}
                </TableCell>
                <TableCell>{profile.profile_type}</TableCell>
                <TableCell>
                  {profile.is_active ? (
                    <span className="text-green-600">Active</span>
                  ) : (
                    <span className="text-gray-500">Inactive</span>
                  )}
                </TableCell>
                <TableCell>
                  {!profile.is_active && (
                    <Button
                      size="sm"
                      onClick={() => handleActivate(profile.id)}
                    >
                      Activate
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

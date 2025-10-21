import { useState, useEffect } from "react";
import {
  userPreferencesService,
  PreferenceProfile,
} from "../../../services/user-preferences";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { toast } from "@/components/ui/usetoast";

interface ProfileFormProps {
  profileId?: string;
  onSave?: () => void;
}

export function ProfileForm({ profileId, onSave }: ProfileFormProps) {
  const [profile, setProfile] = useState<Partial<PreferenceProfile>>({
    name: "",
    preferences: {},
  });

  useEffect(() => {
    if (profileId) {
      loadProfile();
    }
  }, [profileId]);

  const loadProfile = async () => {
    try {
      const response = await userPreferencesService.getProfiles();
      const existingProfile = response.data.find((p) => p.id === profileId);
      if (existingProfile) {
        setProfile(existingProfile);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (profileId) {
        await userPreferencesService.updateProfile(profileId, profile);
      } else {
        await userPreferencesService.createProfile(profile);
      }
      toast({
        title: "Success",
        description: `Profile ${profileId ? "updated" : "created"} successfully`,
      });
      if (onSave) onSave();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: `Failed to ${profileId ? "update" : "create"} profile`,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium">Profile Name</label>
        <Input
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Profile Type</label>
        <Select
          value={profile.preferences.profile_type}
          onChange={(value) =>
            setProfile({
              ...profile,
              preferences: { ...profile.preferences, profile_type: value },
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select profile type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CASUAL">Casual Listening</SelectItem>
            <SelectItem value="PRO">Professional DJ Mode</SelectItem>
            <SelectItem value="CUSTOM">Custom Profile</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit">
        {profileId ? "Update Profile" : "Create Profile"}
      </Button>
    </form>
  );
}

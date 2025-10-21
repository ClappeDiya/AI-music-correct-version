import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Badge } from "@/components/ui/Badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Plus, Bookmark, Star, Trash2, Settings2 } from "lucide-react";
import { useMoodProfiles } from "@/hooks/UseMoodProfiles";
import type { MoodProfile } from "@/lib/api/services/mood";

export function MoodProfiles() {
  const [isCreating, setIsCreating] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const {
    userProfiles,
    trendingProfiles,
    createProfile,
    deleteProfile,
    applyProfile,
    isLoading,
  } = useMoodProfiles();

  // Cast profiles to proper array types
  const userProfilesArray = userProfiles as MoodProfile[] | undefined;
  const trendingProfilesArray = trendingProfiles as MoodProfile[] | undefined;

  const handleCreateProfile = async () => {
    if (!newProfileName.trim()) return;
    await createProfile({
      name: newProfileName,
      parameters: {
        // Save current mood settings as profile parameters
      },
    });
    setNewProfileName("");
    setIsCreating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Mood Profiles</h3>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Profile
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Mood Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Profile Name</Label>
                <Input
                  id="profile-name"
                  placeholder="e.g., Workout Vibes"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                />
              </div>
              <Button onClick={handleCreateProfile} className="w-full">
                Create Profile
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="h-[300px]">
        <div className="space-y-4">
          {userProfilesArray?.map((profile: MoodProfile) => (
            <Card key={profile.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bookmark className="h-4 w-4 text-primary" />
                  <span className="font-medium">{profile.name}</span>
                  <Badge variant="outline" className="text-xs">
                    Personal
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => applyProfile(profile.id)}
                  >
                    <Settings2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteProfile(profile.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {trendingProfilesArray?.map((profile: MoodProfile) => (
            <Card key={profile.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">{profile.name}</span>
                  <Badge variant="outline" className="text-xs">
                    Trending
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applyProfile(profile.id)}
                >
                  <Settings2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-muted-foreground">
                Loading profiles...
              </p>
            </div>
          )}

          {!isLoading &&
            userProfilesArray?.length === 0 &&
            trendingProfilesArray?.length === 0 && (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-muted-foreground">
                  No mood profiles yet
                </p>
              </div>
            )}
        </div>
      </ScrollArea>
    </div>
  );
}

"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Loader2, RefreshCw } from "lucide-react";
import { MoodService, MoodProfile, MoodHistory } from "@/lib/api/services/mood";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/useToast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/Dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  useForm
} from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useCache } from "@/hooks/UseCache";
import { zodResolver } from "@hookform/resolvers/zod";
import { useInView } from "react-intersection-observer";
import { CardSkeleton, ListSkeleton } from "@/components/ui/Skeleton";
import * as z from "zod";

const PAGE_SIZE = 10;

// Create schema for profile form
const profileFormSchema = z.object({
  name: z.string().min(1, "Profile name is required"),
  description: z.string().optional(),
  mood_id: z.number().default(1),
  intensity: z.number().min(0).max(100).default(50)
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function LibraryAndProfiles() {
  const { toast } = useToast();
  const {
    getUserProfiles,
    getMoodHistory,
    createProfile,
    deleteProfile,
    applyProfile,
  } = MoodService;

  const [isCreating, setIsCreating] = useState(false);
  const [regeneratingTrackId, setRegeneratingTrackId] = useState<string | null>(
    null
  );
  
  // Create form with zodResolver and default values
  const profileForm = useForm<ProfileFormValues>(
    profileFormSchema,
    {
      name: "",
      description: "",
      mood_id: 1,
      intensity: 50
    }
  );

  // Ref for infinite scrolling
  const { ref, inView } = useInView();

  // Cache for profiles and history
  const {
    data: profiles,
    isLoading: isLoadingProfiles,
    update: refreshProfiles,
  } = useCache<MoodProfile[]>("mood-profiles", () =>
    getUserProfiles().then((response) => response.data)
  );

  const {
    data: history,
    isLoading: isLoadingHistory,
    update: refreshHistory,
  } = useCache<MoodHistory>("mood-history", () =>
    getMoodHistory().then((response) => response.data)
  );

  // Load next page of history when scrolling
  useEffect(() => {
    if (inView && history && history.tracks && history.tracks.length > 0) {
      loadMoreHistory();
    }
  }, [inView]);

  const handleCreateProfile = async (data: ProfileFormValues) => {
    setIsCreating(true);
    try {
      const result = await createProfile({
        name: data.name,
        parameters: {
          mood_id: data.mood_id,
          intensity: data.intensity
        },
      });
      
      const updatedProfiles = profiles ? [...profiles, result.data] : [result.data];
      refreshProfiles(updatedProfiles, false);
      
      toast({
        title: "Profile Created",
        description: "Your mood profile has been created successfully.",
      });
      
      profileForm.reset({
        name: "",
        description: "",
        mood_id: 1,
        intensity: 50
      });
      
      setIsCreating(false);
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "There was a problem creating your profile.",
        variant: "destructive",
      });
      setIsCreating(false);
    }
  };

  const handleDeleteProfile = async (profileId: number) => {
    try {
      await deleteProfile(profileId);
      const updatedProfiles = profiles ? profiles.filter(p => p.id !== profileId) : [];
      refreshProfiles(updatedProfiles, false);
      toast({
        title: "Profile Deleted",
        description: "The profile has been removed.",
      });
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: "There was a problem deleting the profile.",
        variant: "destructive",
      });
    }
  };

  const handleApplyProfile = async (profileId: number) => {
    try {
      await applyProfile(profileId);
      toast({
        title: "Profile Applied",
        description: "The profile has been applied to your current settings.",
      });
    } catch (error) {
      toast({
        title: "Application Failed",
        description: "There was a problem applying the profile.",
        variant: "destructive",
      });
    }
  };

  const loadMoreHistory = async () => {
    if (!history || !history.tracks || !history.tracks.length) return;
    
    // Implement load more functionality using the next_cursor if available
    if (history.next_cursor) {
      try {
        const response = await getMoodHistory(history.next_cursor);
        // Merge the new tracks with existing ones
        if (response.data && response.data.tracks) {
          const updatedHistory = {
            ...response.data,
            tracks: [...(history.tracks || []), ...(response.data.tracks || [])],
          };
          refreshHistory(updatedHistory, false);
        }
      } catch (error) {
        toast({
          title: "Loading Error",
          description: "Failed to load more history items.",
          variant: "destructive",
        });
      }
    }
  };

  const handleRefreshHistory = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    try {
      const response = await getMoodHistory();
      refreshHistory(response.data, false);
      toast({
        title: "History Refreshed",
        description: "Your track history has been updated.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "There was a problem refreshing your history.",
        variant: "destructive",
      });
    }
  };

  const sortedProfiles = profiles 
    ? [...profiles].sort((a, b) => {
        // Sort by usage count or creation date
        if (a.usage_count && b.usage_count) {
          return b.usage_count - a.usage_count;
        }
        // Fallback sort by created_at (newest first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      })
    : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      {/* Profiles Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">My Profiles</h3>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Profile
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Profile</DialogTitle>
                <DialogDescription>
                  Save your current settings as a reusable profile.
                </DialogDescription>
              </DialogHeader>
              
              <Form 
                form={profileForm} 
                onSubmit={handleCreateProfile}
                className="space-y-4 py-4"
              >
                <FormField
                  control={profileForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My Profile" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={profileForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your profile settings"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Save Profile"
                    )}
                  </Button>
                </DialogFooter>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoadingProfiles ? (
          <div className="space-y-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : profiles && profiles.length > 0 ? (
          <div className="space-y-3">
            {sortedProfiles.map((profile) => (
              <Card
                key={profile.id}
                className="p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-medium">{profile.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Used {profile.usage_count || 0} times
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApplyProfile(profile.id)}
                    >
                      Apply
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteProfile(profile.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 border rounded-lg">
            <p className="text-muted-foreground">
              You haven't created any profiles yet.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Save your favorite settings to quickly reuse them later.
            </p>
          </div>
        )}
      </div>

      {/* History Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Recent Tracks</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefreshHistory}
            disabled={isLoadingHistory}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                isLoadingHistory ? "animate-spin" : ""
              }`}
            />
            Refresh
          </Button>
        </div>

        {isLoadingHistory ? (
          <div className="space-y-3">
            <ListSkeleton />
            <ListSkeleton />
            <ListSkeleton />
          </div>
        ) : history && history.tracks && history.tracks.length > 0 ? (
          <div className="space-y-3">
            {history.tracks.map((track) => (
              <Card
                key={track.id}
                className="p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-medium">Track {track.id.substring(0, 8)}</h4>
                    <p className="text-sm text-muted-foreground">
                      Created {new Date(track.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRegeneratingTrackId(track.id)}
                      disabled={regeneratingTrackId === track.id}
                    >
                      {regeneratingTrackId === track.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Regenerate"
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            {/* Load more trigger */}
            {history.has_more && (
              <div ref={ref} className="h-10 flex justify-center items-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center p-8 border rounded-lg">
            <p className="text-muted-foreground">No tracks in your history</p>
            <p className="text-sm text-muted-foreground mt-1">
              Generate tracks in the Mood Music tab to see them here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

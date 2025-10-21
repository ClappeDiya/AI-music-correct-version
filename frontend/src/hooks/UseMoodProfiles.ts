import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/useToast";
import { MoodService } from "@/lib/api/services/mood";
import type { MoodProfile } from "@/lib/api/services/mood";

export function useMoodProfiles() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: userProfiles, isLoading: isLoadingUserProfiles } = useQuery<
    MoodProfile[]
  >({
    queryKey: ["mood-profiles", "user"],
    queryFn: () => MoodService.getUserProfiles(),
  });

  const { data: trendingProfiles, isLoading: isLoadingTrendingProfiles } =
    useQuery<MoodProfile[]>({
      queryKey: ["mood-profiles", "trending"],
      queryFn: () => MoodService.getTrendingProfiles(),
    });

  const { mutate: createProfile } = useMutation({
    mutationFn: MoodService.createProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mood-profiles"] });
      toast({
        title: "Profile Created",
        description: "Your mood profile has been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create mood profile.",
        variant: "destructive",
      });
    },
  });

  const { mutate: deleteProfile } = useMutation({
    mutationFn: MoodService.deleteProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mood-profiles"] });
      toast({
        title: "Profile Deleted",
        description: "Your mood profile has been deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete mood profile.",
        variant: "destructive",
      });
    },
  });

  const { mutate: applyProfile } = useMutation({
    mutationFn: MoodService.applyProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-mood"] });
      toast({
        title: "Profile Applied",
        description: "Mood settings have been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to apply mood profile.",
        variant: "destructive",
      });
    },
  });

  return {
    userProfiles,
    trendingProfiles,
    createProfile,
    deleteProfile,
    applyProfile,
    isLoading: isLoadingUserProfiles || isLoadingTrendingProfiles,
  };
}

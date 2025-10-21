import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/useToast";
import {
  TrackIntegrationService,
  type TrackIntegration,
  type IntegrationRequest,
} from "@/lib/api/services/track-integration";

export function useTrackIntegration(trackId?: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get track integrations
  const { data: integrations, isLoading: isLoadingIntegrations } = useQuery<
    TrackIntegration[]
  >({
    queryKey: ["track-integrations", trackId],
    queryFn: async () => {
      const response = await TrackIntegrationService.getTrackIntegrations(trackId!);
      return response.data;
    },
    enabled: !!trackId,
  });

  // Get available tracks for a module
  const getAvailableTracks = (
    moduleType: TrackIntegration["target_module"],
  ) => {
    return useQuery({
      queryKey: ["available-tracks", moduleType],
      queryFn: async () => {
        const response = await TrackIntegrationService.getAvailableTracks(moduleType);
        return response.data;
      },
    });
  };

  // Port track to another module
  const { mutate: portTrack } = useMutation({
    mutationFn: async (request: IntegrationRequest) => {
      const response = await TrackIntegrationService.portTrack(request);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["track-integrations"] });
      queryClient.invalidateQueries({ queryKey: ["available-tracks"] });
      toast({
        title: "Track Ported",
        description: `Track has been ported to ${data.target_module} module.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to port track to target module.",
        variant: "destructive",
      });
    },
  });

  // Update emotional context
  const { mutate: updateContext } = useMutation({
    mutationFn: async ({
      trackId,
      context,
    }: {
      trackId: string;
      context: TrackIntegration["emotional_context"];
    }) => {
      const response = await TrackIntegrationService.updateEmotionalContext(trackId, context);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["track-integrations"] });
      toast({
        title: "Context Updated",
        description: "Emotional context has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update emotional context.",
        variant: "destructive",
      });
    },
  });

  // Share track with another user
  const { mutate: shareTrack } = useMutation({
    mutationFn: async ({ trackId, userId }: { trackId: string; userId: number }) => {
      const response = await TrackIntegrationService.shareTrack(trackId, userId);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Track Shared",
        description: "Track has been shared successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to share track.",
        variant: "destructive",
      });
    },
  });

  // Check access to track
  const { data: accessInfo, isLoading: isCheckingAccess } = useQuery({
    queryKey: ["track-access", trackId],
    queryFn: async () => {
      const response = await TrackIntegrationService.checkAccess(trackId!);
      return response.data;
    },
    enabled: !!trackId,
  });

  return {
    integrations,
    isLoadingIntegrations,
    getAvailableTracks,
    portTrack,
    updateContext,
    shareTrack,
    accessInfo,
    isCheckingAccess,
  };
}

import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/useToast";
import {
  MoodService,
  type Mood,
  type GeneratedTrack,
  type MoodFeedback,
} from "@/lib/api/services/mood";
import { type MoodParameters } from "@/components/mood_music/AdvancedMoodControls";

export function useMoodMusic() {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [intensity, setIntensity] = useState(0.5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<GeneratedTrack | null>(null);
  const [advancedParameters, setAdvancedParameters] = useState<MoodParameters>({
    tempo: 120,
    key: "C",
    instrumentation: ["Piano"],
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const generateTrack = useCallback(async () => {
    if (!selectedMood) return;

    setIsGenerating(true);
    try {
      const response = await MoodService.generateTrack({
        mood_id: selectedMood.id,
        intensity,
        parameters: advancedParameters,
      });
      // Extract the track data from the response
      setCurrentTrack(response.data);
      queryClient.invalidateQueries({ queryKey: ["mood-requests"] });
      toast({
        title: "Music Generated",
        description: "Your mood-based track is ready to play.",
      });
    } catch (error) {
      console.error("Failed to generate track:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate music. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [selectedMood, intensity, advancedParameters, queryClient, toast]);

  const submitFeedback = useCallback(
    async (feedback: MoodFeedback) => {
      if (!currentTrack) return;

      try {
        await MoodService.submitFeedback({
          ...feedback,
          track_id: currentTrack.id,
        });
        queryClient.invalidateQueries({ queryKey: ["mood-requests"] });
        toast({
          title: "Feedback Submitted",
          description: "Thank you for your feedback!",
        });
      } catch (error) {
        console.error("Failed to submit feedback:", error);
        toast({
          title: "Error",
          description: "Failed to submit feedback. Please try again.",
          variant: "destructive",
        });
      }
    },
    [currentTrack, queryClient, toast],
  );

  return {
    selectedMood,
    setSelectedMood,
    intensity,
    setIntensity,
    generateTrack,
    isGenerating,
    currentTrack,
    submitFeedback,
    advancedParameters,
    setAdvancedParameters,
  };
}

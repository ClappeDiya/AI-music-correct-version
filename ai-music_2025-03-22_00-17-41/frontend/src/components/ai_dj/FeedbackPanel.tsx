import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/Slider';
import { useToast } from "@/components/ui/useToast";
import {
  ThumbsUp,
  ThumbsDown,
  Heart,
  Frown,
  Smile,
  Zap,
  Sun,
  Moon,
  Music2,
  AlertCircle,
} from "lucide-react";
import { Track } from '@/types/AiDj';
import { aiDjApi } from '@/lib/api/services/AiDj';

interface FeedbackPanelProps {
  track: Track;
  onFeedbackSubmitted?: () => void;
}

interface MoodFeedback {
  energy: number;
  mood: 'happy' | 'neutral' | 'sad';
  intensity: number;
}

export function FeedbackPanel({ track, onFeedbackSubmitted }: FeedbackPanelProps) {
  const [isLiked, setIsLiked] = useState<boolean | null>(null);
  const [moodFeedback, setMoodFeedback] = useState<MoodFeedback>({
    energy: 50,
    mood: 'neutral',
    intensity: 50,
  });
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleLike = async (liked: boolean) => {
    setIsLiked(liked);
    generateFeedbackMessage(liked, moodFeedback);
    
    try {
      await aiDjApi.createFeedback({
        track: track.id,
        feedback_type: liked ? 'like' : 'dislike',
        feedback_notes: JSON.stringify(moodFeedback),
      });

      toast({
        title: "Feedback Recorded",
        description: "Your preferences have been updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record feedback",
        variant: "destructive",
      });
    }
  };

  const handleMoodChange = (mood: 'happy' | 'neutral' | 'sad') => {
    const newMoodFeedback = { ...moodFeedback, mood };
    setMoodFeedback(newMoodFeedback);
    generateFeedbackMessage(isLiked, newMoodFeedback);
  };

  const generateFeedbackMessage = (liked: boolean | null, mood: MoodFeedback) => {
    if (liked === null) return;

    let message = "DJ has learned that you ";
    if (liked) {
      message += "like ";
    } else {
      message += "dislike ";
    }

    message += `tracks with ${mood.energy}% energy level and a ${mood.mood} mood.`;
    setFeedbackMessage(message);
  };

  const handleSubmitFeedback = async () => {
    if (isLiked === null) return;

    setIsSubmitting(true);
    try {
      await aiDjApi.createFeedback({
        track: track.id,
        feedback_type: isLiked ? 'like' : 'dislike',
        feedback_notes: JSON.stringify({
          ...moodFeedback,
          timestamp: new Date().toISOString(),
        }),
      });

      toast({
        title: "Feedback Submitted",
        description: "Thank you for helping improve your DJ experience",
      });

      if (onFeedbackSubmitted) {
        onFeedbackSubmitted();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit detailed feedback",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Music2 className="h-5 w-5 mr-2" />
          Track Feedback
        </CardTitle>
        <CardDescription>
          Help your AI DJ understand your preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Track Info */}
          <div className="text-sm">
            <p className="font-medium">{track.title}</p>
            <p className="text-muted-foreground">{track.artist}</p>
          </div>

          {/* Like/Dislike */}
          <div className="flex justify-center space-x-4">
            <Button
              variant={isLiked === true ? "default" : "outline"}
              size="lg"
              onClick={() => handleLike(true)}
            >
              <ThumbsUp className="h-5 w-5 mr-2" />
              Like
            </Button>
            <Button
              variant={isLiked === false ? "default" : "outline"}
              size="lg"
              onClick={() => handleLike(false)}
            >
              <ThumbsDown className="h-5 w-5 mr-2" />
              Dislike
            </Button>
          </div>

          {/* Mood Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Track Mood</label>
            <div className="flex justify-center space-x-4">
              <Button
                variant={moodFeedback.mood === 'happy' ? "default" : "outline"}
                onClick={() => handleMoodChange('happy')}
              >
                <Smile className="h-4 w-4 mr-2" />
                Happy
              </Button>
              <Button
                variant={moodFeedback.mood === 'neutral' ? "default" : "outline"}
                onClick={() => handleMoodChange('neutral')}
              >
                <Heart className="h-4 w-4 mr-2" />
                Neutral
              </Button>
              <Button
                variant={moodFeedback.mood === 'sad' ? "default" : "outline"}
                onClick={() => handleMoodChange('sad')}
              >
                <Frown className="h-4 w-4 mr-2" />
                Sad
              </Button>
            </div>
          </div>

          {/* Energy Level */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Energy Level</label>
            <div className="flex items-center space-x-4">
              <Moon className="h-4 w-4" />
              <Slider
                value={[moodFeedback.energy]}
                onValueChange={([value]) =>
                  setMoodFeedback({ ...moodFeedback, energy: value })
                }
                min={0}
                max={100}
                step={1}
                className="flex-1"
              />
              <Sun className="h-4 w-4" />
            </div>
          </div>

          {/* Intensity */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Intensity</label>
            <div className="flex items-center space-x-4">
              <AlertCircle className="h-4 w-4" />
              <Slider
                value={[moodFeedback.intensity]}
                onValueChange={([value]) =>
                  setMoodFeedback({ ...moodFeedback, intensity: value })
                }
                min={0}
                max={100}
                step={1}
                className="flex-1"
              />
              <Zap className="h-4 w-4" />
            </div>
          </div>

          {/* Feedback Message */}
          {feedbackMessage && (
            <div className="p-4 bg-muted rounded-lg text-sm">
              {feedbackMessage}
            </div>
          )}

          {/* Submit Button */}
          <Button
            className="w-full"
            onClick={handleSubmitFeedback}
            disabled={isLiked === null || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 


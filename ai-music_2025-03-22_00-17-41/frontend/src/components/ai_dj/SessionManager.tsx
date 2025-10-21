import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Slider } from '@/components/ui/Slider';
import { useToast } from "@/components/ui/useToast";
import { 
  PlayCircle, 
  StopCircle, 
  Mic, 
  Music2, 
  Volume2,
  Sun,
  Moon,
  Zap
} from "lucide-react";
import { AIDJSession } from '@/types/AiDj';
import { useAiDj } from "@/hooks/useAiDj";
import { VoiceCommand } from "./VoiceCommand";

interface SessionManagerProps {
  currentSession: AIDJSession | null;
  onSessionStart?: () => void;
  onSessionEnd?: () => void;
}

export function SessionManager({ 
  currentSession, 
  onSessionStart, 
  onSessionEnd 
}: SessionManagerProps) {
  const [energy, setEnergy] = useState(50);
  const [mood, setMood] = useState("neutral");
  const [genre, setGenre] = useState("");
  const { startSession, endSession, updateMoodSettings } = useAiDj();
  const { toast } = useToast();

  const handleStartSession = async () => {
    try {
      await startSession({
        energy,
        mood,
        genre: genre || undefined,
      });
      if (onSessionStart) {
        onSessionStart();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start session",
        variant: "destructive",
      });
    }
  };

  const handleEndSession = async () => {
    try {
      await endSession();
      if (onSessionEnd) {
        onSessionEnd();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to end session",
        variant: "destructive",
      });
    }
  };

  const handleMoodUpdate = async () => {
    try {
      await updateMoodSettings({
        energy,
        mood,
        genre: genre || undefined,
      });
      toast({
        title: "Success",
        description: "Mood settings updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update mood settings",
        variant: "destructive",
      });
    }
  };

  const handleVoiceCommand = async (command: string) => {
    // Voice commands are handled in the VoiceCommand component
    // This is just for additional session-specific handling if needed
    toast({
      title: "Voice Command Received",
      description: command,
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>AI DJ Session</CardTitle>
          <CardDescription>
            {currentSession 
              ? `Session active since ${new Date(currentSession.updated_at).toLocaleString()}`
              : "Start a new session to begin"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Energy Level</label>
              <div className="flex items-center space-x-4">
                <Moon className="h-4 w-4" />
                <Slider
                  value={[energy]}
                  onValueChange={(value) => setEnergy(value[0])}
                  min={0}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <Sun className="h-4 w-4" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Mood</label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="happy">Happy</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="melancholic">Melancholic</SelectItem>
                  <SelectItem value="energetic">Energetic</SelectItem>
                  <SelectItem value="relaxed">Relaxed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Preferred Genre (Optional)</label>
              <Input
                placeholder="Enter genre..."
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-between">
            {!currentSession ? (
              <Button
                onClick={handleStartSession}
                className="w-full"
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                Start Session
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleMoodUpdate}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Update Mood
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleEndSession}
                >
                  <StopCircle className="h-4 w-4 mr-2" />
                  End Session
                </Button>
              </>
            )}
          </div>

          {currentSession?.last_voice_command && (
            <div className="pt-4 border-t">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mic className="h-4 w-4" />
                <span>Last voice command: {currentSession.last_voice_command}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <VoiceCommand
        isSessionActive={!!currentSession}
        onCommandReceived={handleVoiceCommand}
      />
    </div>
  );
} 


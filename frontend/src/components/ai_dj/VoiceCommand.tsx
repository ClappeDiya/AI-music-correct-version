import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useToast } from "@/components/ui/useToast";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { aiDjApi } from '@/lib/api/services/AiDj';

interface VoiceCommandProps {
  onCommandReceived?: (command: string) => void;
  isSessionActive: boolean;
}

export function VoiceCommand({ onCommandReceived, isSessionActive }: VoiceCommandProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if browser supports speech recognition
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const command = event.results[0][0].transcript;
        setTranscript(command);
        handleCommand(command);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Error",
          description: "Failed to recognize speech. Please try again.",
          variant: "destructive",
        });
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognition);
    }
  }, []);

  const handleCommand = async (command: string) => {
    if (!isSessionActive) {
      toast({
        title: "Error",
        description: "Please start a session before using voice commands",
        variant: "destructive",
      });
      return;
    }

    try {
      // Process common DJ commands
      const normalizedCommand = command.toLowerCase();
      let moodSettings = {};

      if (normalizedCommand.includes('play') && normalizedCommand.includes('something')) {
        if (normalizedCommand.includes('upbeat') || normalizedCommand.includes('energetic')) {
          moodSettings = { energy: 80, mood: 'energetic' };
        } else if (normalizedCommand.includes('relaxing') || normalizedCommand.includes('calm')) {
          moodSettings = { energy: 20, mood: 'relaxed' };
        } else if (normalizedCommand.includes('happy')) {
          moodSettings = { energy: 65, mood: 'happy' };
        } else if (normalizedCommand.includes('melancholic') || normalizedCommand.includes('sad')) {
          moodSettings = { energy: 35, mood: 'melancholic' };
        }
      }

      // Update session with voice command
      await aiDjApi.updateSession(undefined, {
        last_voice_command: command,
        mood_settings: moodSettings,
      });

      if (onCommandReceived) {
        onCommandReceived(command);
      }

      toast({
        title: "Command Received",
        description: "Processing your request: " + command,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process voice command",
        variant: "destructive",
      });
    }
  };

  const toggleListening = () => {
    if (!recognition) {
      toast({
        title: "Error",
        description: "Speech recognition is not supported in your browser",
        variant: "destructive",
      });
      return;
    }

    if (!isSessionActive) {
      toast({
        title: "Error",
        description: "Please start a session before using voice commands",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      setTranscript("");
      recognition.start();
      setIsListening(true);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center space-x-4">
          <Button
            variant={isListening ? "destructive" : "default"}
            onClick={toggleListening}
            disabled={!isSessionActive}
            className="w-full"
          >
            {isListening ? (
              <>
                <MicOff className="h-4 w-4 mr-2" />
                Stop Listening
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                Start Voice Command
              </>
            )}
          </Button>
        </div>

        {transcript && (
          <div className="mt-4 p-3 bg-muted rounded-md">
            <p className="text-sm font-medium">Last Command:</p>
            <p className="text-sm text-muted-foreground">{transcript}</p>
          </div>
        )}

        {isListening && (
          <div className="mt-4 flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="ml-2 text-sm">Listening...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 


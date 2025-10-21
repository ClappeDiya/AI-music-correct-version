"use client";

import { useEffect, useState } from "react";
import { VoiceRecorder } from '@/components/voice_cloning/VoiceRecorder';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useToast } from "@/components/ui/useToast";
import { VoiceRecordingSession, VoiceSample, voiceCloning } from "@/services/api/voice_cloning";
import { Loader2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

interface Props {
  params: {
    id: string;
  };
}

export default function RecordingSessionPage({ params }: Props) {
  const [session, setSession] = useState<VoiceRecordingSession | null>(null);
  const [samples, setSamples] = useState<VoiceSample[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSession();
  }, [params.id]);

  const loadSession = async () => {
    try {
      const [sessionResponse, samplesResponse] = await Promise.all([
        voiceCloning.getRecordingSessions(),
        voiceCloning.getVoiceSamples(parseInt(params.id)),
      ]);

      const sessionData = sessionResponse.data.find(s => s.id === parseInt(params.id));
      if (!sessionData) throw new Error("Session not found");

      setSession(sessionData);
      setSamples(samplesResponse.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load recording session",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecordingComplete = async (blob: Blob) => {
    try {
      setIsProcessing(true);
      const formData = new FormData();
      formData.append('file', blob, 'recording.webm');
      formData.append('session', params.id);

      await voiceCloning.uploadVoiceSample(formData);
      await loadSession(); // Reload samples
      
      toast({
        title: "Success",
        description: "Voice sample uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload voice sample",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading || !session) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Recording Session: {session.session_name}</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Record Voice Sample</CardTitle>
          </CardHeader>
          <CardContent>
            <VoiceRecorder
              onRecordingComplete={handleRecordingComplete}
              isProcessing={isProcessing}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recorded Samples ({samples.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {samples.map((sample) => (
                <div
                  key={sample.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <audio src={sample.file_url} controls className="w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 